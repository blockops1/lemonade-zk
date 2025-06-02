// Development Configuration Example
module.exports = {
  // Network configuration
  network: {
    // WebSocket endpoint for the network
    endpoint: 'wss://your-network-endpoint',
    
    // Chain ID for the target network
    chainId: 1,
    
    // Gas price settings
    gasPrice: {
      default: '5000000000', // 5 Gwei
      max: '100000000000'    // 100 Gwei
    }
  },
  
  // Zero-knowledge configuration
  zk: {
    // Path to the compiled circuit
    circuitPath: 'src/zk/circuits/target/lemonade_proof.json',
    
    // Path to the verification key
    verificationKeyPath: 'src/zk/circuits/target/vk.hex',
    
    // Directory for WASM files
    wasmDirectory: 'dist/wasm'
  },
  
  // Development settings
  development: {
    // Port for development server
    port: 9000,
    
    // Enable source maps
    sourceMaps: true,
    
    // Hot Module Replacement
    hmr: false
  },

  // Server Configuration
  server: {
    host: 'localhost',
    env: 'development'
  },

  // Web3 Configuration
  web3: {
    networkId: 1337,  // Local network ID
    rpcUrl: 'http://localhost:8545',
    chainId: 1337
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