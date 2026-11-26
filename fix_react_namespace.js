const fs = require('fs');
const path = require('path');

function fixReactImports(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            fixReactImports(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Check if file uses React as a value (React.forwardRef, React.useEffect, etc.)
            const hasReactValueRef = /React\.(forwardRef|useState|useEffect|useRef|useCallback|useMemo|createContext|createElement|memo|Component|ReactNode|FC)/.test(content);
            
            if (hasReactValueRef) {
                // Check if React is imported as namespace
                const hasNamespaceImport = content.includes("import * as React from 'react'") || content.includes('import * as React from "react"');
                const hasDefaultImport = content.includes("import React from 'react'") || content.includes('import React from "react"');
                
                if (!hasNamespaceImport && !hasDefaultImport) {
                    // Add namespace import after the first import line
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith('import ') && !lines[i].startsWith('import type')) {
                            lines.splice(i, 0, "import * as React from 'react';");
                            break;
                        }
                    }
                    fs.writeFileSync(fullPath, lines.join('\n'));
                    changed = true;
                    console.log('Added namespace import: ' + fullPath);
                }
            }
        }
    }
}

fixReactImports(path.join(__dirname, 'components'));
fixReactImports(path.join(__dirname, 'app'));
