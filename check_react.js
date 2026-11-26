const fs = require('fs');
const path = require('path');

function checkAndAdd(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            checkAndAdd(fullPath);
        } else if (entry.name === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes("from 'react'") && !content.includes('from "react"')) {
                console.log('MISSING React: ' + fullPath);
            }
        }
    }
}

checkAndAdd(path.join(__dirname, 'app'));
