const fs = require('fs');
const path = require('path');

const files = [
    'test1-10.txt',
    'test11-20.txt',
    'test21-30.txt',
    'test31-40.txt',
    'test41-50.txt',
    'test51-60.txt'
];

console.log("Analyzing file contents...");

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        const lines = content.split(/\r?\n/).filter(l => l.trim());

        // Count typical markers
        const bilets = lines.filter(l => l.match(/^\d+[-\s]*BILET/i)).length;
        // Count F1 markers (start of answers)
        const f1s = lines.filter(l => l.match(/^[\*\-\s]*F1\b/i) || l.match(/^[\*\-\s]*F\s*1\b/i)).length;

        console.log(`File: ${file}`);
        console.log(`  Lines: ${lines.length}`);
        console.log(`  Tickets found: ${bilets}`);
        console.log(`  Questions (approx F1 count): ${f1s}`);

        // Print first few lines of F1 matches to see format
        const sampleF1 = lines.find(l => l.match(/^[\*\-\s]*F1/i));
        if (sampleF1) console.log(`  Sample F1: "${sampleF1}"`);

        console.log('-----------------------------------');
    } catch (e) {
        console.log(`Error reading ${file}: ${e.message}`);
    }
}
