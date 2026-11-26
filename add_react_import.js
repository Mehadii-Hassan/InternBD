const fs = require('fs');
const path = require('path');

function addReactImport(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            addReactImport(fullPath);
        } else if (entry.name === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes("from 'react'") && !content.includes('from "react"')) {
                // Add React import after the first import line
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ') || lines[i].startsWith('export ')) {
                        lines.splice(i, 0, "import React from 'react';");
                        break;
                    }
                }
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

addReactImport(path.join(__dirname, 'app'));
