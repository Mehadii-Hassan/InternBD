const fs = require('fs');
const content = fs.readFileSync('node_modules/lucide-react/dist/cjs/lucide-react.js', 'utf8');
const importMatch = content.match(/require\(['"][^'"]*react['\"]\)/);
console.log('React require:', importMatch ? importMatch[0] : 'not found');
const reactRefMatch = content.match(/React\./g);
console.log('Total React. references:', reactRefMatch ? reactRefMatch.length : 0);
if (reactRefMatch) {
    console.log('First 5:', reactRefMatch.slice(0, 5).join(', '));
}
