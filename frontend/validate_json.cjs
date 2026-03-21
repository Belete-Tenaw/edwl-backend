const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Users\\belet\\EDWL-Project\\frontend\\src\\locales\\en.json',
    'c:\\Users\\belet\\EDWL-Project\\frontend\\src\\locales\\am.json'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`${path.basename(file)} is valid JSON.`);
        
        // Check for duplicates (manual scan because JSON.parse overwrites)
        const keys = content.match(/"[^"]+":/g);
        const uniqueKeys = new Set();
        const duplicates = [];
        keys.forEach(k => {
            if (uniqueKeys.has(k)) duplicates.push(k);
            else uniqueKeys.add(k);
        });
        if (duplicates.length > 0) {
            console.log(`Duplicate keys found in ${path.basename(file)}:`, [...new Set(duplicates)]);
        }
    } catch (err) {
        console.error(`Error in ${path.basename(file)}:`, err.message);
    }
});
