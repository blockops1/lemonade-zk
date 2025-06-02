import { compile, initialize } from '@noir-lang/noir_wasm';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from 'circuit.json';

// Debug log the circuit import
console.log('Circuit import:', {
    circuit,
    hasCircuit: !!circuit,
    hasBytecode: !!(circuit && circuit.bytecode),
    keys: circuit ? Object.keys(circuit) : [],
    bytecodeType: circuit && circuit.bytecode ? typeof circuit.bytecode : 'undefined',
    bytecodeLength: circuit && circuit.bytecode ? circuit.bytecode.length : 0,
    isBase64: circuit && circuit.bytecode ? /^[A-Za-z0-9+/=]+$/.test(circuit.bytecode) : false
});

class GameState {
    constructor(currentAssets = 200, totalProfit = 0, dayCount = 0, bestDayProfit = 0, totalGlassesSold = 0, bankruptcyCount = 0) {
        this.currentAssets = currentAssets;
        this.totalProfit = totalProfit;
        this.dayCount = dayCount;
        this.bestDayProfit = bestDayProfit;
        this.totalGlassesSold = totalGlassesSold;
        this.bankruptcyCount = bankruptcyCount;
    }

    toNoirInput() {
        return {
            current_assets: this.currentAssets.toString(),
            total_profit: this.totalProfit.toString(),
            day_count: this.dayCount.toString(),
            best_day_profit: this.bestDayProfit.toString(),
            total_glasses_sold: this.totalGlassesSold.toString(),
            bankruptcy_count: this.bankruptcyCount.toString()
        };
    }
}

class ZkProver {
    constructor() {
        this.currentState = new GameState();
        this.dailyProofs = [];
        this.finalProof = null;
        this.proofStatus = document.getElementById('proof-status');
        this.proofDisplay = document.getElementById('proof-display');
        this.noir = null;
        this.backend = null;
        this.initialized = false;
        this.initPromise = null;

        // Create proof display element if it doesn't exist
        if (!this.proofDisplay) {
            this.proofDisplay = document.createElement('pre');
            this.proofDisplay.id = 'proof-display';
            this.proofDisplay.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                max-width: 400px;
                max-height: 300px;
                overflow: auto;
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
            `;
            document.body.appendChild(this.proofDisplay);
        }
    }

    updateProofStatus(message) {
        if (this.proofStatus) {
            this.proofStatus.textContent = message;
        }
        console.log('Proof Status:', message);
    }

    displayProof(dayNumber, proof, input) {
        if (this.proofDisplay) {
            const proofData = {
                day: dayNumber,
                timestamp: new Date().toISOString(),
                input,
                proof: proof ? proof.slice(0, 100) + '...' : 'No proof generated'
            };
            this.proofDisplay.textContent = 'Latest Proof:\n' + JSON.stringify(proofData, null, 2);
        }
    }

    async initialize() {
        if (this.initialized) {
            return true;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                console.log('Initializing Noir WASM for browser-based proof generation...');
                this.updateProofStatus('Initializing ZK system...');

                // Debug log the circuit again
                console.log('Circuit before initialization:', {
                    circuit,
                    hasCircuit: !!circuit,
                    hasBytecode: !!(circuit && circuit.bytecode),
                    keys: circuit ? Object.keys(circuit) : [],
                    bytecodeType: circuit && circuit.bytecode ? typeof circuit.bytecode : 'undefined',
                    bytecodeLength: circuit && circuit.bytecode ? circuit.bytecode.length : 0,
                    isBase64: circuit && circuit.bytecode ? /^[A-Za-z0-9+/=]+$/.test(circuit.bytecode) : false,
                    bytecodeStart: circuit && circuit.bytecode ? circuit.bytecode.substring(0, 100) : ''
                });

                // Initialize the WASM module first
                await initialize();

                // Initialize the backend with the circuit
                this.backend = new BarretenbergBackend(circuit);
                await this.backend.init();
                
                // Create Noir instance with initialized backend and circuit ABI
                this.noir = new Noir(circuit.abi, this.backend);
                
                console.log('Noir WASM initialized successfully');
                this.updateProofStatus('ZK system ready');
                this.initialized = true;
                return true;
            } catch (error) {
                console.error('Failed to initialize ZkProver:', error);
                this.updateProofStatus('Failed to initialize ZK system');
                this.initialized = false;
                throw error;
            }
        })();

        return this.initPromise;
    }

    async generateDailyProof(dayNumber, glassesMade, signsMade, price, weather, glassesSold, randomFactor) {
        if (!this.initialized) {
            try {
                await this.initialize();
            } catch (error) {
                return {
                    success: false,
                    error: 'ZK system not initialized'
                };
            }
        }

        console.log('Generating proof for day', dayNumber, 'with inputs:', {
            glassesMade,
            signsMade,
            price,
            weather,
            glassesSold,
            randomFactor,
            currentState: this.currentState
        });

        // Calculate expected final state based on inputs
        const lemonadeCost = glassesMade * 0.02;
        const signsCost = signsMade * 0.15;
        const totalCost = lemonadeCost + signsCost;
        const revenue = glassesSold * (price / 100);
        const profit = revenue - totalCost;
        
        const newState = new GameState(
            Math.round((this.currentState.currentAssets + (profit * 100))), // Convert to cents and round
            Math.round((this.currentState.totalProfit + (profit * 100))),
            this.currentState.dayCount + 1,
            Math.round(Math.max(this.currentState.bestDayProfit, profit * 100)),
            this.currentState.totalGlassesSold + glassesSold,
            this.currentState.bankruptcyCount + (this.currentState.currentAssets + profit * 100 <= 0 ? 1 : 0)
        );

        // If bankrupt, reset assets to $2.00
        if (newState.currentAssets <= 0) {
            newState.currentAssets = 200; // $2.00 in cents
        }

        console.log('Calculated new state:', newState);

        try {
            this.updateProofStatus('Generating proof...');
            
            // Prepare inputs for Noir circuit
            const input = {
                initial_state: this.currentState.toNoirInput(),
                final_state: newState.toNoirInput(),
                day_number: dayNumber.toString(),
                glasses_made: glassesMade.toString(),
                signs_made: signsMade.toString(),
                price: price.toString(),
                weather: weather.toString(),
                glasses_sold: glassesSold.toString(),
                random_factor: randomFactor.toString()
            };

            console.log('Generating UltraPlonk proof with inputs:', input);
            
            // Generate proof using Noir
            const proof = await this.noir.generateProof(input);
            console.log('Proof generated successfully:', {
                proof,
                size: proof ? proof.length : 0
            });

            // Display the proof in the browser
            this.displayProof(dayNumber, proof, input);

            // Store state update and proof
            this.currentState = newState;
            this.dailyProofs.push({
                dayNumber,
                glassesMade,
                signsMade,
                price,
                weather,
                glassesSold,
                randomFactor,
                profit,
                proof
            });

            // Optionally store in localStorage
            try {
                localStorage.setItem('lemonade_proofs', JSON.stringify(this.dailyProofs));
            } catch (e) {
                console.warn('Could not store proofs in localStorage:', e);
            }

            this.updateProofStatus(`Day ${dayNumber} completed! Proof generated and stored.`);

            return {
                success: true,
                proof,
                newState
            };

        } catch (error) {
            console.error('Error generating proof:', error);
            this.updateProofStatus('Error: Could not generate proof for this day\'s operations.');
            this.displayProof(dayNumber, null, {
                error: error.message,
                input: {
                    initial_state: this.currentState.toNoirInput(),
                    final_state: newState.toNoirInput(),
                    day_number: dayNumber.toString(),
                    glasses_made: glassesMade.toString(),
                    signs_made: signsMade.toString(),
                    price: price.toString(),
                    weather: weather.toString(),
                    glasses_sold: glassesSold.toString(),
                    random_factor: randomFactor.toString()
                }
            });
            return {
                success: false,
                error: error.message
            };
        }
    }

    async submitFinalProof() {
        if (!this.initialized) {
            return {
                success: false,
                error: 'ZK system not initialized'
            };
        }

        console.log('Collecting final game statistics and proofs...');
        
        const finalStats = {
            totalDays: this.currentState.dayCount,
            finalAssets: this.currentState.currentAssets,
            totalProfit: this.currentState.totalProfit,
            bestDayProfit: this.currentState.bestDayProfit,
            totalGlassesSold: this.currentState.totalGlassesSold,
            bankruptcies: this.currentState.bankruptcyCount
        };

        console.log('Final game statistics:', finalStats);
        console.log('Total proofs generated:', this.dailyProofs.length);

        this.finalProof = {
            stats: finalStats,
            proofs: this.dailyProofs.map(p => p.proof)
        };

        this.updateProofStatus('Game completed! All proofs generated successfully.');

        return {
            success: true,
            stats: finalStats,
            proofs: this.dailyProofs.map(p => p.proof)
        };
    }

    getDailyProofs() {
        return this.dailyProofs;
    }

    getFinalProof() {
        return this.finalProof;
    }

    getGameState() {
        return this.currentState;
    }
}

export default ZkProver; 