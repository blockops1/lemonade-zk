# Lemonade Stand with Zero-Knowledge Proofs

A classic Lemonade Stand game enhanced with zero-knowledge proofs to verify game state transitions.

## Project Structure

```
lemonade-zk/
├── src/                  # Source code
│   ├── assets/          # Static assets
│   ├── components/      # React components
│   ├── game/           # Game logic
│   ├── utils/          # Utility functions
│   ├── wallet/         # Wallet integration
│   ├── zk/             # Zero-knowledge related code
│   │   ├── circuits/   # Noir circuits
│   │   └── proofs/     # Proof generation/verification
│   └── index.js        # Application entry point
├── public/             # Public assets
│   └── index.html      # HTML template
├── dist/               # Build output
│   └── wasm/          # Compiled WASM files
├── scripts/           # Build and utility scripts
└── webpack.config.js  # Webpack configuration
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

This will:
- Start webpack dev server
- Watch for WASM file changes
- Serve the application at http://localhost:9000

## Building

1. For production:
```bash
npm run build
```

2. For development:
```bash
npm start
```

## Zero-Knowledge Proofs

The game uses zero-knowledge proofs to verify:
- Valid game state transitions
- Correct profit calculations
- Legitimate game completion

### Circuit Development

1. Circuit modifications should be made in `src/zk/circuits/`
2. After modifying circuits:
   ```bash
   cd src/zk/circuits
   nargo compile
   ```
3. The compiled circuit will be available in `src/zk/circuits/target/`

### Proof Generation

Proofs are generated for:
- Each day's transactions
- Final game state verification

## Testing

Run tests with:
```bash
npm test
```

## Configuration

Copy `config.example.js` to `config.js` and update the values:

```javascript
module.exports = {
  // Network configuration
  network: {
    endpoint: 'wss://your-network-endpoint',
    chainId: 1
  },
  
  // Zero-knowledge configuration
  zk: {
    circuitPath: 'src/zk/circuits/target/lemonade_proof.json',
    verificationKeyPath: 'src/zk/circuits/target/vk.hex',
    wasmDirectory: 'dist/wasm'
  }
}
```

## Key Components

### Zero-Knowledge Integration
- `src/zk/circuits/`: Contains the compiled circuit definitions
- `src/zk/proofs/`: Handles proof generation for game actions
- `src/zk/verifier/`: Manages proof verification

### Game Logic
- `src/game/game.js`: Core game mechanics and state management
- `src/game/LemonadeStand.js`: Main game class implementation

### Build System
- Webpack configuration optimized for WASM and ZK proof integration
- Efficient chunk splitting and caching
- Source map generation for development

## Development Guidelines

### Adding New Features
1. Place new components in appropriate directories
2. Follow the established module structure
3. Update webpack configuration if needed

### Working with ZK Proofs
1. Circuit modifications should be made in `zk-proof/lemonade_proof/`
2. Compile circuits before building the application
3. Test proof generation and verification thoroughly

## Troubleshooting

### Common Issues
1. Memory Issues
   - Increase Node.js memory limit if needed
   - Use production build for better performance

2. WASM Loading
   - Check browser console for WASM-related errors
   - Verify WASM files are properly copied to public directory

3. Build Problems
   - Clear cache and node_modules if experiencing build issues
   - Verify all dependencies are properly installed

## License

MIT License - See LICENSE file for details 