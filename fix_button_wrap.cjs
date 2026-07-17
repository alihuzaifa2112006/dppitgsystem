const fs = require('fs');
const path = require('path');

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('-sheet-grid.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('<Button variant="contained" color="primary" onClick={')) {
        content = content.replace(
          '<Button variant="contained" color="primary" onClick={',
          '<Button variant="contained" color="primary" sx={{ whiteSpace: \'nowrap\', flexShrink: 0 }} onClick={'
        );
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(sectionsBase);
console.log('Button wrapping fixed!');
