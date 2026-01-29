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

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        const lines = content.split(/\r?\n/).filter(l => l.trim());

        const fMarkers = lines.filter(l => l.match(/^F\d+/)).length;
        const biletMarkers = lines.filter(l => l.match(/^\d+-BILET/i)).length;
        const imageMarkers = lines.filter(l => l.match(/^http/i)).length;

        console.log(`File: ${file}`);
        console.log(`  Lines: ${lines.length}`);
        console.log(`  F-markers: ${fMarkers}`);
        console.log(`  Bilet headers: ${biletMarkers}`);
        console.log(`  Image URLs: ${imageMarkers}`);
        console.log('-----------------------------------');
    } catch (e) {
        console.log(`Error reading ${file}: ${e.message}`);
    }
}
