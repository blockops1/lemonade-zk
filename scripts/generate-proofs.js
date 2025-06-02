const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const TOML = require('@iarna/toml');

// Update paths to use new directory structure
const NOIR_PROJECT_PATH = path.join(__dirname, '../src/zk/circuits');

function generateProof(proofInput) {
    try {
        // Compile the circuit
        console.log('Compiling circuit...');
        execSync('nargo compile', { cwd: NOIR_PROJECT_PATH });

        // Generate proof
        console.log('Generating proof...');
        const proofResult = execSync('nargo prove', { 
            cwd: NOIR_PROJECT_PATH,
            input: JSON.stringify(proofInput)
        });

        return {
            success: true,
            proof: proofResult.toString()
        };
    } catch (error) {
        console.error('Error generating proof:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// If running directly from command line
if (require.main === module) {
    // Read proof input from stdin or file
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error('Usage: node generate-proofs.js <input-file>');
        process.exit(1);
    }

    const proofInput = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const result = generateProof(proofInput);
    
    if (result.success) {
        console.log('Proof generated successfully!');
        console.log('Proof:', result.proof);
    } else {
        console.error('Failed to generate proof:', result.error);
        process.exit(1);
    }
}

module.exports = { generateProof }; 