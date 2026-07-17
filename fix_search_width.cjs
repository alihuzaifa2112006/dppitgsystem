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
      
      // Replace fixed width with fullWidth + right margin
      if (content.includes("sx={{ width: { xs: 1, md: 320 } }}")) {
        content = content.replace(
          "sx={{ width: { xs: 1, md: 320 } }}",
          "fullWidth sx={{ mr: 2 }}"
        );
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(sectionsBase);
console.log('Search bars are now full width!');
