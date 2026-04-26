const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'prisma', 'apply_indices.sql');
let content = fs.readFileSync(filePath, 'utf8');

// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    console.log('BOM stripped from SQL file.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SQL file verified as UTF-8 without BOM.');
