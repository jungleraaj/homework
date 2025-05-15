// script.js

// Get references to HTML elements
const subjectSelectionDiv = document.getElementById('subject-selection');
const homeworkInputsDiv = document.getElementById('homework-inputs');
const submitButton = document.getElementById('submit-btn');
const generatedImage = document.getElementById('generated-image');
const shareButton = document.getElementById('share-btn');
const homeworkCanvas = document.getElementById('homework-canvas');
const baseImage = document.getElementById('base-image'); // Reference to the hidden base image element
const textColorPicker = document.getElementById('text-color-picker'); // Reference to the color input

const schoolName = "ELS School System";
// Subjects are read from checkboxes, but keeping an array for reference might be useful
// const subjects = ['Math', 'Science', 'English', 'Urdu', 'Computer'];

// --- Dynamic Input Field Creation ---
// Listen for changes in the subject selection area (checkbox clicks)
subjectSelectionDiv.addEventListener('change', (event) => {
    // Check if the change was on a checkbox
    if (event.target.type === 'checkbox') {
        const subject = event.target.value; // Get the subject name (checkbox value)
        const inputId = `homework-${subject.toLowerCase().replace(/\s+/g, '-')}`; // Create a unique ID for the textarea
        const existingInputDiv = document.getElementById(`${inputId}-div`); // Check if the input div already exists

        if (event.target.checked && !existingInputDiv) {
            // If checkbox is checked and input doesn't exist, create it
            const subjectInputDiv = document.createElement('div');
            subjectInputDiv.classList.add('subject-homework-input');
            subjectInputDiv.id = `${inputId}-div`; // Set ID on the container div
            subjectInputDiv.innerHTML = `
                <label for="${inputId}">${subject} Homework:</label>
                <textarea id="${inputId}" name="${inputId}"></textarea>
            `;
            homeworkInputsDiv.appendChild(subjectInputDiv); // Add the new input div to the inputs area
        } else if (!event.target.checked && existingInputDiv) {
            // If checkbox is unchecked and input exists, remove it
            existingInputDiv.remove();
        }
    }
});

// --- Helper function for Canvas Text Wrapping ---
// Breaks a string into lines that fit within a maximum width
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' '); // Split text into words
    let line = ''; // Start with an empty line
    let currentY = y; // Starting Y position for drawing

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '; // Add the next word to the current line
        const metrics = context.measureText(testLine); // Measure the width of this potential line
        const testWidth = metrics.width;

        // If the test line is wider than the max width AND it's not the very first word (to avoid infinite loop on long single words)
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, currentY); // Draw the current line (which fits)
            line = words[n] + ' '; // Start a new line with the current word
            currentY += lineHeight; // Move down for the next line
        } else {
            line = testLine; // The word fits, keep building the current line
        }
    }
    // Draw the last line (or the only line if no wrapping occurred)
    context.fillText(line, x, currentY);

    // Return the Y position *after* drawing the last line.
    // This helps in positioning the content that follows.
    return currentY;
}


// --- Generate Image on Submit ---
submitButton.addEventListener('click', () => {
    const homeworkData = {}; // Object to store collected homework data
    const selectedSubjects = subjectSelectionDiv.querySelectorAll('input[type="checkbox"]:checked'); // Get all checked subject checkboxes

    // Check if any subjects are selected
    if (selectedSubjects.length === 0) {
        alert('Please select at least one subject.');
        return; // Stop the function if no subjects are selected
    }

    // Collect homework text for selected subjects
    selectedSubjects.forEach(checkbox => {
        const subject = checkbox.value;
        const inputId = `homework-${subject.toLowerCase().replace(/\s+/g, '-')}`;
        const textarea = document.getElementById(inputId);
        // Check if the textarea exists and has text
        if (textarea && textarea.value.trim() !== '') {
            homeworkData[subject] = textarea.value.trim(); // Store the trimmed text
        }
    });

    // Check if any homework was actually entered for selected subjects
    if (Object.keys(homeworkData).length === 0) {
        alert('Please enter some homework text for the selected subjects.');
        return;
    }


    // --- Canvas Drawing Logic ---
    // Ensure the base image is loaded before attempting to draw
    if (!baseImage.complete || baseImage.naturalHeight === 0) {
         alert('Base template image not loaded. Please try again.');
         console.error("Base image not loaded or failed to load.");
         return;
    }

    const ctx = homeworkCanvas.getContext('2d');

    // Set canvas size to match the base image dimensions
    homeworkCanvas.width = baseImage.naturalWidth;
    homeworkCanvas.height = baseImage.naturalHeight;

    // --- Draw the base image ---
    ctx.drawImage(baseImage, 0, 0);

    // Get the selected text color
    const textColor = textColorPicker.value;
    ctx.fillStyle = textColor; // Set the drawing color for all text

    // --- Draw School Name ---
    ctx.font = 'Bold 40px Arial'; // Adjust font size and style as needed
    ctx.textAlign = 'center'; // Align text to the center horizontally
    const schoolNameY = 80; // <<<< ADJUST THIS Y COORDINATE based on your base image layout
    ctx.fillText(schoolName, homeworkCanvas.width / 2, schoolNameY); // Draw school name at the center top

    // --- Draw Homework Details ---
    let currentY = 200; // <<<< ADJUST THIS STARTING Y POSITION based on your base image layout
    const lineHeight = 30; // Space between lines of text drawn by wrapText
    const subjectSpacing = 40; // Vertical space between different subject entries
    const startX = 80; // <<<< ADJUST THIS STARTING X POSITION for text on your base image
    const homeworkAreaWidth = homeworkCanvas.width - (startX * 2); // Calculate available width for homework text

    ctx.textAlign = 'left'; // Set text alignment back to left for subject/homework details

    // Iterate through the collected homework data
    for (const subject in homeworkData) {
        if (homeworkData[subject]) {
            // Draw Subject Name
            ctx.font = 'Bold 22px Arial'; // Adjust subject font size and style
            ctx.fillText(`${subject}:`, startX, currentY); // Draw subject name

            // Calculate where the homework text should start (next to the subject name)
            const subjectNameWidth = ctx.measureText(`${subject}:`).width;
            const homeworkTextStartX = startX + subjectNameWidth + 15; // <<<< ADJUST space after subject name

            // Calculate the width available for the homework text itself
            const availableWidthForHomeworkText = homeworkCanvas.width - homeworkTextStartX - startX; // Assuming right margin is similar to left

            ctx.font = '18px Arial'; // Adjust homework text font size and style

            // Use the wrapText function to draw the homework text
            // The wrapText function returns the Y position after the last line was drawn
            const finalYAfterHomework = wrapText(ctx, homeworkData[subject], homeworkTextStartX, currentY, availableWidthForHomeworkText, lineHeight);

            // Update the currentY for the next subject entry.
            // We need to add vertical space based on how much text was drawn for the current subject.
            currentY = finalYAfterHomework + subjectSpacing; // Move down for the next subject block
        }
    }

    // Convert canvas to image and display
    const imageUrl = homeworkCanvas.toDataURL('image/png'); // Get image data as a Data URL
    generatedImage.src = imageUrl; // Set the src of the img tag
    generatedImage.style.display = 'block'; // Make the image visible
    shareButton.style.display = 'block'; // Make the share button visible
});

// --- Share Button Logic ---
shareButton.addEventListener('click', () => {
    // Check if Web Share API is available in the browser
    if (navigator.share && homeworkCanvas.toBlob) { // Also check for toBlob support
        // Convert canvas content to a Blob (binary data)
        homeworkCanvas.toBlob((blob) => {
            // Create a File object from the Blob
            const files = [new File([blob], 'els_school_homework.png', { type: 'image/png' })];

            // Use the Web Share API to share
            navigator.share({
                files: files, // Share the image file
                title: 'ELS School System Homework', // Title for the shared content
                text: 'Daily Homework from ELS School System', // Default text message
                // url: 'Optional: Link to your app or image if hosted elsewhere'
            }).then(() => {
                console.log('Homework shared successfully');
            }).catch((error) => {
                console.error('Error sharing:', error);
                // Provide user feedback if sharing fails
                alert(`Could not share the image. Error: ${error.message}. You can save the image manually.`);
            });
        }, 'image/png'); // Specify the desired image format (PNG)
    } else {
        // Fallback for browsers/devices that do not support Web Share API
        alert('Sharing is not supported on this browser or device. Please save the image manually by long-pressing on it (on mobile) or right-clicking (on desktop).');
        // Optionally, provide a download link here using the Data URL
    }
});

// --- Initial Setup / Base Image Loading Check ---
// It's important that the base image is loaded before we can draw on the canvas.
// This event listener fires when the image is successfully loaded.
baseImage.onload = () => {
    console.log("Base template image loaded successfully.");
    // The submit button is enabled by default in HTML, but if you wanted
    // to disable it until the image loads, you would enable it here.
    // submitButton.disabled = false;
};

// Handle potential errors if the base image fails to load
baseImage.onerror = () => {
    console.error("Error loading base template image. Please ensure 'img/base_homework_template.png' exists and is accessible.");
    alert("Error loading base template image. Homework image generation will not work.");
    submitButton.disabled = true; // Disable submit if base image fails
};

// Check if the image is already complete (e.g., due to browser caching)
if (baseImage.complete) {
    baseImage.onload(); // Manually trigger the onload logic if already complete
} else {
    // If not complete, disable the submit button until it loads to prevent errors
    // submitButton.disabled = true; // Uncomment this line if you want to disable initially
}

// --- Basic Color Picker Change Listener (Optional for immediate color feedback, but not real-time canvas update) ---
// This listener is just if you want to do something when the color changes,
// like maybe update a small swatch. It does NOT redraw the canvas.
textColorPicker.addEventListener('input', () => {
    console.log("Text color selected:", textColorPicker.value);
    // If you wanted a *very* basic preview, you could change the color
    // of a sample text block here, but not the canvas image.
});
