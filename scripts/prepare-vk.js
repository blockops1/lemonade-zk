const fs = require('fs');
const path = require('path');

// Read the binary verification key
const vkPath = path.join(__dirname, '../zk-proof/lemonade_proof/target/vk');
const vk = fs.readFileSync(vkPath);

// Create a buffer for the number of public inputs (9)
const numInputs = Buffer.alloc(4);
numInputs.writeUInt32BE(9, 0);

// Convert to hex string
const vkHex = '0x' + numInputs.toString('hex') + vk.slice(4).toString('hex');

// Extract the first 1632 bytes (zkVerify format)
const zkVerifyVk = vkHex.slice(0, 2 + 1632 * 2); // 2 for '0x' prefix, *2 because hex uses 2 chars per byte

// Save the hex string
const outputPath = path.join(__dirname, '../zk-proof/lemonade_proof/target/vk.hex');
fs.writeFileSync(outputPath, zkVerifyVk);

console.log('Verification key hex format saved to:', outputPath);
console.log('Length:', (zkVerifyVk.length - 2) / 2, 'bytes');
console.log('Number of public inputs:', numInputs.readUInt32BE(0));

console.log('\nYou can now use this hex string in Polkadot.js:');
console.log('1. Go to https://polkadot.js.org/apps/');
console.log('2. Connect to zkVerify Volta testnet');
console.log('3. Go to Developer -> Extrinsics');
console.log('4. Select your account with test VFY tokens');
console.log('5. Choose ultraplonk -> registerVerificationKey');
console.log('6. Paste the contents of vk.hex into the vk field');
console.log('7. Submit the transaction'); 