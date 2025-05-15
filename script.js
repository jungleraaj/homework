// script.js file mein submit button ke listener ke andar jahan aap homework draw kar rahe hain

// ... canvas setup and base image drawing ...

// Draw Homework Details
let yPos = 150; // Starting Y position for homework (adjust based on base image layout)
const lineHeight = 25; // Space between lines of text (adjust based on font size and preference)
const homeworkAreaWidth = 800; // Max width for homework text in pixels (adjust based on base image layout)
const startX = 50; // Starting X position for text (adjust based on base image layout)

// --- Text Wrapping Function ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
    return currentY; // Return the final Y position after drawing this block
}
// --- End Text Wrapping Function ---


for (const subject in homeworkData) {
    if (homeworkData[subject]) {
        // Draw Subject Name
        ctx.font = 'Bold 20px Arial'; // Subject font
        ctx.fillStyle = document.getElementById('text-color-picker').value; // Use selected color
        ctx.textAlign = 'left';
        ctx.fillText(`${subject}:`, startX, yPos); // Draw subject name

        // Draw Homework Text (using the wrapping function)
        ctx.font = '18px Arial'; // Homework font
        // Calculate the starting Y for the homework text next to the subject name
        const homeworkTextStartX = startX + ctx.measureText(`${subject}:`).width + 10; // Add some space after subject name
        // Adjust homework text area width if needed, considering subject name space
        const homeworkTextWidth = homeworkAreaWidth - (homeworkTextStartX - startX);


        // Call the wrapping function for the actual homework text
        const finalYAfterHomework = wrapText(ctx, homeworkData[subject], homeworkTextStartX, yPos, homeworkTextWidth, lineHeight);

        // Update yPos for the next subject entry.
        // You might need more vertical space depending on how much homework text was drawn.
        yPos = finalYAfterHomework + lineHeight * 1.5; // Move down for the next subject block (adjust multiplier)
    }
}

// ... rest of the code (toDataURL, display image, etc.) ...
