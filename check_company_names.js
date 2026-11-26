const fs = require('fs');
const content = fs.readFileSync('data/internships.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('company_name:')) {
    const match = line.match(/company_name:\s*(.+),/);
    if (match) {
      const val = match[1].trim();
      if (val === 'undefined' || val === 'null' || val === '') {
        console.log('Line ' + (i+1) + ': ' + line.trim());
      }
    }
  }
});
