const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Update paths to use new directory structure
const WASM_SRC_DIR = path.join(__dirname, '../src/zk/circuits/target');
const WASM_DEST_DIR = path.join(__dirname, '../dist/wasm');

// Ensure destination directory exists
if (!fs.existsSync(WASM_DEST_DIR)) {
    fs.mkdirSync(WASM_DEST_DIR, { recursive: true });
}

// Watch for changes in WASM files
const watcher = chokidar.watch(path.join(WASM_SRC_DIR, '**/*.wasm'), {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

console.log(chalk.blue('Watching for WASM file changes...'));

// Copy WASM files on change
watcher
    .on('add', copyWasmFile)
    .on('change', copyWasmFile)
    .on('unlink', removeWasmFile)
    .on('error', error => console.error(chalk.red('Error:', error)));

function copyWasmFile(srcPath) {
    const fileName = path.basename(srcPath);
    const destPath = path.join(WASM_DEST_DIR, fileName);
    
    try {
        fs.copyFileSync(srcPath, destPath);
        console.log(chalk.green(`✓ Copied ${fileName} to dist/wasm/`));
    } catch (error) {
        console.error(chalk.red(`✗ Failed to copy ${fileName}:`, error.message));
    }
}

function removeWasmFile(srcPath) {
    const fileName = path.basename(srcPath);
    const destPath = path.join(WASM_DEST_DIR, fileName);
    
    try {
        if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
            console.log(chalk.yellow(`✓ Removed ${fileName} from dist/wasm/`));
        }
    } catch (error) {
        console.error(chalk.red(`✗ Failed to remove ${fileName}:`, error.message));
    }
} 