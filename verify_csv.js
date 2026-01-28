const fs = require('fs');
const path = require('path');

const csvPath = 'ticket_60_tests.csv';

try {
    const stats = fs.statSync(csvPath);
    console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`Last Modified: ${stats.mtime.toISOString()}`);

    const content = fs.readFileSync(csvPath, 'utf8');

    // Naive split by newline isn't enough for CSV if there are quoted newlines
    // But counting "starting quotes" at the beginning of lines might help
    // Or just checking total matches of header pattern?

    // Let's implement a simple CSV parser state machine to count rows correctly
    let rowCount = 0;
    let inQuote = false;
    let fieldStart = true;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === '\n' && !inQuote) {
            rowCount++;
        }
    }

    // Add one for the last row if no trailing newline
    if (content.length > 0 && content[content.length - 1] !== '\n') {
        rowCount++;
    }

    console.log(`Total CSV Rows (Header + Data): ${rowCount}`);
    console.log(`Estimated Data Rows: ${rowCount - 1}`);

    // Check first few and last few lines nicely
    const lines = content.split('\n');
    console.log('\n--- First 2 lines ---');
    console.log(lines.slice(0, 2).join('\n'));
    console.log('\n--- Last 2 lines ---');
    console.log(lines.slice(-2).join('\n'));

} catch (err) {
    console.error("Error verifying CSV:", err.message);
}
