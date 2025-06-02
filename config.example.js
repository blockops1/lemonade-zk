// Development Configuration Example
module.exports = {
  // Server Configuration
  server: {
    port: 9000,
    host: 'localhost',
    env: 'development'
  },

  // Web3 Configuration
  web3: {
    networkId: 1337,  // Local network ID
    rpcUrl: 'http://localhost:8545',
    chainId: 1337
  },

  // ZK Proof Configuration
  zkProof: {
    circuitPath: 'zk-proof/lemonade_proof/target/lemonade_proof.json',
    verificationKeyPath: 'zk-proof/lemonade_proof/target/vk.hex',
    wasmDirectory: 'public/wasm'
  },

  // Smart Contract Configuration
  contracts: {
    verifier: '',  // Add verifier contract address after deployment
    game: ''       // Add game contract address after deployment
  },

  // Game Configuration
  game: {
    maxDays: 30,
    winAmount: 100,  // $100 to win
    startingBalance: 2,  // $2 starting money
    maxBankruptcies: 2
  }
}; 