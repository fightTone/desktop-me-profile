const fs = require('fs');
const path = require('path');

// Update paths for Docker environment
const filesDirectory = '/usr/share/nginx/html/files';
const outputFile = '/usr/share/nginx/html/data/files.json';

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    const fileList = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const relativePath = path.relative(filesDirectory, filePath);

        if (stats.isFile()) {
            fileList.push({
                name: file,
                path: relativePath,
                size: stats.size,
                modifiedDate: stats.mtime
            });
        } else if (stats.isDirectory()) {
            fileList.push(...scanDirectory(filePath));
        }
    });

    return fileList;
}

try {
    if (!fs.existsSync(filesDirectory)) {
        fs.mkdirSync(filesDirectory, { recursive: true });
    }

    const fileList = scanDirectory(filesDirectory);
    
    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(fileList, null, 2));
    console.log('File list generated successfully!');
} catch (error) {
    console.error('Error generating file list:', error);
    process.exit(1);
}
