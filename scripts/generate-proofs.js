const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const TOML = require('@iarna/toml');

// Path to the Noir project
const NOIR_PROJECT_PATH = path.join(__dirname, '../zk-proof/lemonade_proof');

function generateProof(proofInput) {
    try {
        // Write input to Prover.toml
        const tomlContent = TOML.stringify(proofInput);
        fs.writeFileSync(path.join(NOIR_PROJECT_PATH, 'Prover.toml'), tomlContent);

        // Run Noir prove command
        console.log('Generating proof...');
        execSync('nargo prove', { 
            cwd: NOIR_PROJECT_PATH,
            stdio: 'inherit'
        });

        // Read the generated proof
        const proofPath = path.join(NOIR_PROJECT_PATH, 'target/proofs/lemonade_proof.proof');
        const proof = fs.readFileSync(proofPath);
        
        return {
            success: true,
            proof: proof.toString('hex')
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