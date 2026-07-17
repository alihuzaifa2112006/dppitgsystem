const fs = require('fs');
const path = require('path');

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix useMemo warning in sheet-grids
      if (content.includes('const reportData = [];')) {
        content = content.replace('const reportData = [];', 'const reportData = useMemo(() => [], []);');
        changed = true;
      }

      // Fix button alignment in forms
      if (content.includes('<Stack direction="row" mt={3}>')) {
        content = content.replace('<Stack direction="row" mt={3}>', '<Stack direction="row" justifyContent="flex-end" mt={3}>');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(sectionsBase);
console.log('Fixed ESLint warnings and button alignment!');
