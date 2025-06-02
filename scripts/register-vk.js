const { zkVerifySession } = require('zkverifyjs');
const fs = require('fs');
const path = require('path');

async function registerVerificationKey() {
    try {
        // Read the verification key
        const vkPath = path.join(__dirname, '../zk-proof/lemonade_proof/target/vk');
        const vk = fs.readFileSync(vkPath);
        
        console.log('Starting zkVerify session...');
        
        // Start a session with Volta testnet
        const session = await zkVerifySession.start()
            .Volta()
            .withWallet({
                source: process.env.WALLET_SOURCE,
                accountAddress: process.env.ACCOUNT_ADDRESS,
            });

        console.log('Registering verification key...');
        
        // Register the verification key for UltraPlonk
        const { events, transactionResult } = await session
            .registerVerificationKey()
            .ultraplonk({
                numberOfPublicInputs: 9 // Number of public inputs in our circuit
            })
            .execute(vk);

        // Listen for events
        events.on('includedInBlock', (eventData) => {
            console.log('Transaction included in block:', eventData);
        });

        events.on('finalized', (eventData) => {
            console.log('Transaction finalized:', eventData);
        });

        // Wait for the transaction result
        const result = await transactionResult;
        console.log('Verification key registered successfully!');
        console.log('Statement hash:', result.statementHash);

        // Save the statement hash for later use
        fs.writeFileSync(
            path.join(__dirname, '../zk-proof/lemonade_proof/target/statement_hash'),
            result.statementHash
        );

        // Close the session
        await session.close();

    } catch (error) {
        console.error('Error registering verification key:', error);
        process.exit(1);
    }
}

// Run the registration
registerVerificationKey().catch(console.error); 