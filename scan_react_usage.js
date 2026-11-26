const fs = require('fs');
const path = require('path');

function scanReactUsage(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanReactUsage(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const reactValueRefs = content.match(/React\.(forwardRef|createElement|memo|useState|useEffect|useRef|useCallback|useMemo|createContext|Fragment|Component|PureComponent|Suspense|lazy|forwardRef|isValidElement|cloneElement|useContext|useDebugValue|useDeferredValue|useId|useImperativeHandle|useInsertionEffect|useLayoutEffect|useReducer|useRef|useState|useSyncExternalStore|useTransition|cache|cacheSignal|captureOwnerStack|startTransition|unstable_useCacheRefresh|version|Children|version)/g);
            if (reactValueRefs) {
                console.log(fullPath + ':');
                reactValueRefs.forEach(r => console.log('  ' + r));
            }
        }
    }
}

scanReactUsage(path.join(__dirname, 'app'));
scanReactUsage(path.join(__dirname, 'components'));
