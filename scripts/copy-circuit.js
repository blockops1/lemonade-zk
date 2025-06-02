const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceDir = path.join(__dirname, '../zk-proof/lemonade_proof/target');
const destDir = path.join(__dirname, '../public/zk-proof/lemonade_proof/target');

// Create destination directory if it doesn't exist
fs.mkdirSync(destDir, { recursive: true });

// Files to copy
const files = [
    'lemonade_proof.json',
    'proof',
    'vk',
    'vk.hex'
];

// Copy each file
files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    try {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied ${file} to public directory`);
        } else {
            console.warn(`Warning: ${file} not found in source directory`);
        }
    } catch (error) {
        console.error(`Error copying ${file}:`, error);
    }
}); 