const fs = require('fs');
const path = require('path');

function scanAndFix(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanAndFix(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Check if file uses React as a value (React.forwardRef, React.ComponentProps, etc.)
            const hasReactValueRef = /React\.(forwardRef|ComponentProps|FC|ReactNode|createElement|memo|useState|useEffect|useRef|useCallback|useMemo)/.test(content);
            
            if (hasReactValueRef) {
                // Check how React is imported
                const defaultImport = content.match(/import React from ['"]react['"]/);
                const namespaceImport = content.match(/import \* as React from ['"]react['"]/);
                
                if (defaultImport && !namespaceImport) {
                    // Replace default import with namespace import
                    content = content.replace(/import React from ['"]react['"];/, "import * as React from 'react';");
                    changed = true;
                    console.log('Fixed default import to namespace import: ' + fullPath);
                } else if (!defaultImport && !namespaceImport) {
                    // No React import at all but uses React. - add namespace import
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
            
            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

scanAndFix(path.join(__dirname, 'components'));
