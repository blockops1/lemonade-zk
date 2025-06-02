const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Update paths to use new directory structure
const CIRCUIT_PATH = path.join(__dirname, '../src/zk/circuits');
const vkPath = path.join(CIRCUIT_PATH, 'target/vk');
const vkHexPath = path.join(CIRCUIT_PATH, 'target/vk.hex');

async function registerVerificationKey() {
    try {
        // Check if verification key exists
        if (!fs.existsSync(vkPath)) {
            console.error('Verification key not found. Please compile the circuit first.');
            return false;
        }

        // Read verification key
        const vk = fs.readFileSync(vkPath);
        console.log('Verification key loaded:', vk.length, 'bytes');

        // Convert to hex if needed
        if (!fs.existsSync(vkHexPath)) {
            const vkHex = '0x' + vk.toString('hex');
            fs.writeFileSync(vkHexPath, vkHex);
            console.log('Verification key converted to hex');
        }

        // Get statement hash
        const statementHash = execSync(
            'nargo get-statement-hash',
            { cwd: CIRCUIT_PATH }
        ).toString().trim();

        console.log('Statement hash:', statementHash);

        return {
            success: true,
            vk: vk.toString('hex'),
            statementHash
        };
    } catch (error) {
        console.error('Error registering verification key:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { registerVerificationKey }; 