const fs = require('fs');
const path = require('path');

const walkDir = (dir, baseDir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath, baseDir));
    } else {
      results.push('/' + path.relative(baseDir, filePath).replace(/\\/g, '/'));
    }
  });
  
  return results;
};

const publicDir = path.join(__dirname, '../public');
const filesDir = path.join(publicDir, 'files');

if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

const files = walkDir(filesDir, publicDir);
const jsonContent = JSON.stringify(files, null, 2);

fs.writeFileSync(
  path.join(filesDir, 'directory.json'),
  jsonContent
);

console.log('Generated directory.json with contents:');
console.log(jsonContent);
console.log('\nFile list saved to:', path.join(filesDir, 'directory.json'));
