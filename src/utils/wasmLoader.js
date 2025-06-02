// WASM Module cache
const wasmCache = new Map();

/**
 * Load and cache a WASM module
 * @param {string} path - Path to the WASM file
 * @param {Object} importObject - Optional import object for the WASM module
 * @returns {Promise<WebAssembly.Instance>}
 */
export async function loadWasmModule(path, importObject = {}) {
    // Check cache first
    if (wasmCache.has(path)) {
        return wasmCache.get(path);
    }

    try {
        // Fetch and instantiate the WASM module
        const response = await fetch(path);
        const wasmBuffer = await response.arrayBuffer();
        const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);

        // Cache the instantiated module
        wasmCache.set(path, wasmModule.instance);

        return wasmModule.instance;
    } catch (error) {
        console.error(`Failed to load WASM module from ${path}:`, error);
        throw error;
    }
}

/**
 * Initialize multiple WASM modules in parallel
 * @param {Array<{path: string, importObject: Object}>} modules 
 * @returns {Promise<Map<string, WebAssembly.Instance>>}
 */
export async function initializeWasmModules(modules) {
    try {
        const loadPromises = modules.map(({ path, importObject }) => 
            loadWasmModule(path, importObject)
        );

        const instances = await Promise.all(loadPromises);
        
        return new Map(
            modules.map(({ path }, index) => [path, instances[index]])
        );
    } catch (error) {
        console.error('Failed to initialize WASM modules:', error);
        throw error;
    }
}

/**
 * Clear the WASM module cache
 */
export function clearWasmCache() {
    wasmCache.clear();
}

/**
 * Check if WebAssembly is supported in the current environment
 * @returns {boolean}
 */
export function isWasmSupported() {
    try {
        return typeof WebAssembly === 'object' 
            && typeof WebAssembly.instantiate === 'function'
            && typeof WebAssembly.Instance === 'function'
            && typeof WebAssembly.Module === 'function';
    } catch {
        return false;
    }
} 