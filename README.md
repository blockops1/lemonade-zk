# Lemonade Stand Game with ZK Proofs

A modern web-based remake of the classic Apple II game "Lemonade Stand" with Zero-Knowledge Proof integration. Run your own virtual lemonade business while dealing with weather conditions, inventory management, and pricing strategies - all with cryptographic verification of game states.

## Features

- Classic gameplay mechanics with modern improvements
- Dynamic weather system affecting sales
- Detailed financial reporting
- Multiple game states (win/bankruptcy conditions)
- Zero-Knowledge Proof verification of game states
- Browser-based gameplay
- Web3 wallet integration

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Rust (for Noir circuit compilation)
- [Nargo](https://noir-lang.org/getting_started/nargo_installation) (Noir's package manager)
- A modern web browser with WebAssembly support
- A Web3 wallet (e.g., MetaMask) for blockchain interactions

## Environment Setup

1. Install Rust and Cargo:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Nargo:
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noir/master/installer/install.sh | bash
```

3. Clone the repository:
```bash
git clone https://github.com/blockops1/lemonade-zk.git
cd lemonade-zk
```

4. Install Node.js dependencies:
```bash
npm install
```

5. Configure your environment:
   - Copy `config.example.js` to `config.js`
   - Update the configuration values as needed
   - If using a local blockchain, ensure it's running and update the RPC URL

## Building the ZK Circuit

1. Compile the Noir circuit:
```bash
cd zk-proof/lemonade_proof
nargo compile
cd ../..
```

2. Copy the circuit artifacts:
```bash
npm run copy-circuit
```

## Development

1. Start the development server:
```bash
npm start
```

2. Open http://localhost:9000 in your browser

3. Connect your Web3 wallet when prompted

## Build for Production

```bash
npm run build
```

The production build will be available in the `dist` directory.

## Project Structure

```
lemonade-zk/
├── src/                    # Source code
│   ├── game/              # Game logic
│   └── wallet/            # Wallet integration
├── zk-proof/              # Zero-Knowledge proof circuits
│   └── lemonade_proof/    # Main game circuit
├── public/                # Static assets
└── config.example.js      # Configuration template
```

## Game Instructions

1. Each day you'll need to make three decisions:
   - How many glasses of lemonade to make (at $0.02 per glass)
   - How many advertising signs to make (at $0.15 per sign)
   - What price to charge per glass (in cents)

2. Weather conditions affect sales:
   - Sunny: Normal sales
   - Hot and Dry: Increased sales
   - Cloudy: Reduced sales

3. Win conditions:
   - Reach $100 in assets, or
   - Survive for 30 days

4. Lose condition:
   - Go bankrupt twice

## Zero-Knowledge Proof System

The game uses Zero-Knowledge Proofs to verify:
- Valid game state transitions
- Correct score calculations
- Legitimate win conditions

The proofs are generated client-side using WebAssembly and can be verified on-chain.

## Technologies Used

- JavaScript (ES6+)
- Noir (Zero-Knowledge Proof circuit language)
- WebAssembly
- Webpack
- Node.js
- Web3.js

## Troubleshooting

### Common Issues

1. WASM loading errors:
   - Make sure your browser supports WebAssembly
   - Check that the WASM files are properly built
   - Clear browser cache if needed

2. Circuit compilation errors:
   - Ensure Nargo is properly installed
   - Check Rust toolchain version
   - Run `nargo clean` before recompiling

3. Webpack build issues:
   - Clear the `dist` and `public/dist` directories
   - Remove node_modules and run `npm install` again
   - Check for Node.js version compatibility

## License

MIT License 