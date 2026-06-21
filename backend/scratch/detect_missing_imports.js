const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const filesToCheck = [];
walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.js')) {
        filesToCheck.push(filePath);
    }
});

console.log(`Scanning ${filesToCheck.length} files in ${srcDir}...`);

filesToCheck.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(srcDir, file);
    
    // Check for prisma
    const usesPrisma = content.includes('prisma') && !file.includes('prismaMock') && !file.includes('prisma.js');
    const importsPrisma = content.includes('require(') && (content.includes('prisma') || content.includes('/prisma'));
    
    // Check for logAction
    const usesLogAction = content.includes('logAction');
    const importsLogAction = content.includes('logAction') && content.includes('require(') && (content.includes('auditService') || content.includes('auditLog'));

    if (usesPrisma && !importsPrisma) {
        // Double check it's not a comment or local definition
        if (/\bprisma\b/.test(content)) {
            console.log(`⚠️  ${relativePath}: Uses 'prisma' but does NOT seem to import it!`);
        }
    }

    if (usesLogAction && !importsLogAction) {
        // Double check it's not a local definition
        if (/\blogAction\b/.test(content) && !content.includes('const logAction =')) {
            console.log(`⚠️  ${relativePath}: Uses 'logAction' but does NOT seem to import it!`);
        }
    }
});
console.log('Scan complete.');
