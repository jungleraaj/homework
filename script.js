const subjectSelectionDiv = document.getElementById('subject-selection');
const homeworkInputsDiv = document.getElementById('homework-inputs');
const submitButton = document.getElementById('submit-btn');
const generatedImage = document.getElementById('generated-image');
const shareButton = document.getElementById('share-btn');
const homeworkCanvas = document.getElementById('homework-canvas');
const baseImage = document.getElementById('base-image'); // Reference to the hidden base image

const schoolName = "ELS School System";
const subjects = ['Math', 'Science', 'English', 'Urdu', 'Computer']; // Use this array or get from checkboxes

// --- Dynamic Input Field Creation ---
subjectSelectionDiv.addEventListener('change', (event) => {
    if (event.target.type === 'checkbox') {
        const subject = event.target.value;
        const inputId = `homework-${subject.toLowerCase()}`;
        const existingInput = document.getElementById(inputId);

        if (event.target.checked && !existingInput) {
            // Create input field for the subject
            const subjectInputDiv = document.createElement('div');
            subjectInputDiv.classList.add('subject-homework-input');
            subjectInputDiv.innerHTML = `
                <label for="${inputId}">${subject} Homework:</label>
                <textarea id="${inputId}" name="${inputId}"></textarea>
            `;
            homeworkInputsDiv.appendChild(subjectInputDiv);
        } else if (!event.target.checked && existingInput) {
            // Remove input field if subject is unchecked
            existingInput.parentElement.remove();
        }
    }
});

// --- Generate Image on Submit ---
submitButton.addEventListener('click', () => {
    const homeworkData = {};
    const selectedSubjects = subjectSelectionDiv.querySelectorAll('input[type="checkbox"]:checked');

    if (selectedSubjects.length === 0) {
        alert('Please select at least one subject.');
        return;
    }

    selectedSubjects.forEach(checkbox => {
        const subject = checkbox.value;
        const inputId = `homework-${subject.toLowerCase()}`;
        const textarea = document.getElementById(inputId);
        if (textarea) {
            homeworkData[subject] = textarea.value.trim();
        }
    });

    // --- Canvas Drawing Logic ---
    // This is a simplified outline. Actual drawing needs careful coordinate management,
    // font handling, and text wrapping.

    const ctx = homeworkCanvas.getContext('2d');

    // Ensure canvas size matches the base image or desired output size
    homeworkCanvas.width = baseImage.naturalWidth;
    homeworkCanvas.height = baseImage.naturalHeight;

    // Draw the base image
    ctx.drawImage(baseImage, 0, 0);

    // Draw School Name
    ctx.font = 'Bold 30px Arial'; // Adjust font as needed
    ctx.fillStyle = '#000'; // Adjust color
    ctx.textAlign = 'center'; // Adjust alignment
    ctx.fillText(schoolName, homeworkCanvas.width / 2, 50); // Adjust position

    // Draw Homework Details
    let yPos = 150; // Starting Y position for homework (adjust based on base image)
    const lineHeight = 30; // Space between lines

    for (const subject in homeworkData) {
        if (homeworkData[subject]) {
            ctx.font = 'Bold 20px Arial'; // Subject font
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.fillText(`${subject}:`, 50, yPos); // Adjust X position

            ctx.font = '18px Arial'; // Homework font
            // *** Text Wrapping Logic Needed Here ***
            // Simple fillText will not wrap. You need a function to break long text into lines.
            // For simplicity, this example just draws one line (might overflow).
            ctx.fillText(homeworkData[subject], 150, yPos); // Adjust X position

            yPos += lineHeight; // Move down for the next subject/line
        }
    }

    // Convert canvas to image and display
    const imageUrl = homeworkCanvas.toDataURL('image/png');
    generatedImage.src = imageUrl;
    generatedImage.style.display = 'block'; // Show the image
    shareButton.style.display = 'block'; // Show the share button

    // Store the image Blob for sharing (optional, can generate on share click too)
    // homeworkCanvas.toBlob((blob) => {
    //     // Store blob if needed later for sharing
    // }, 'image/png');
});

// --- Share Button Logic ---
shareButton.addEventListener('click', () => {
    // Check if Web Share API is available
    if (navigator.share) {
        // Convert canvas to Blob for sharing
        homeworkCanvas.toBlob((blob) => {
            const files = [new File([blob], 'homework.png', { type: 'image/png' })];
            navigator.share({
                files: files,
                title: 'ELS School Homework',
                text: 'Here is the homework for today:',
                // url: 'Optional URL if you host the image somewhere'
            }).then(() => {
                console.log('Shared successfully');
            }).catch((error) => {
                console.error('Error sharing:', error);
                alert('Could not share the image.'); // User feedback on failure
            });
        }, 'image/png'); // Specify image type
    } else {
        // Fallback for browsers/devices that don't support Web Share API
        alert('Sharing is not supported on this browser. You can download the image or take a screenshot.');
        // Optionally, provide a download link for the image URL
    }
});

// --- Initial Setup ---
// Ensure base image is loaded before drawing on canvas
baseImage.onload = () => {
    console.log("Base image loaded.");
    // You might want to initially draw the empty template on canvas or just wait for submit
};
baseImage.onerror = () => {
    console.error("Error loading base image.");
    // Handle error, maybe disable submit button or show a message
};

// Make sure to handle the case where the image might already be cached.
if (baseImage.complete) {
    baseImage.onload(); // Manually trigger onload if already complete
}