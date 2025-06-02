import { zkVerifySession } from 'zkverifyjs';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { readFileSync } from 'fs';
import { join } from 'path';

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
        this.session = null;
        this.vkBase64 = null;
        this.noir = null;
        this.backend = null;
    }

    async initialize() {
        // Start a read-only session since we're just generating proofs
        this.session = await zkVerifySession.start().Volta();
        
        // Initialize Noir circuit
        this.backend = new BarretenbergBackend(this.session);
        
        // Load the circuit
        const circuitPath = join(__dirname, '../../zk-proof/lemonade_proof');
        this.noir = new Noir(circuitPath, this.backend);
        
        // Load and cache the verification key
        this.vkBase64 = await this.loadVerificationKey();
    }

    async loadVerificationKey() {
        try {
            // Load the verification key from the compiled circuit
            const vkPath = join(__dirname, '../../zk-proof/lemonade_proof/target/vk.bin');
            const vkBuffer = readFileSync(vkPath);
            return vkBuffer.toString('base64');
        } catch (error) {
            console.error('Failed to load verification key:', error);
            throw new Error('Failed to load verification key. Make sure the circuit is compiled.');
        }
    }

    async generateNoirProof(inputs) {
        if (!this.noir) {
            throw new Error('Noir circuit not initialized. Call initialize() first.');
        }

        try {
            // Generate the proof using Noir
            const { proof } = await this.noir.generateFinalProof(inputs);
            
            // Convert the proof to base64
            const proofBuffer = Buffer.from(proof);
            return proofBuffer.toString('base64');
        } catch (error) {
            console.error('Failed to generate Noir proof:', error);
            throw error;
        }
    }

    async generateDailyProof(dayNumber, glassesMade, signsMade, price, weather, glassesSold, randomFactor) {
        if (!this.session) {
            await this.initialize();
        }

        // Calculate expected final state based on inputs
        const lemonadeCost = glassesMade * 0.02;
        const signsCost = signsMade * 0.15;
        const totalCost = lemonadeCost + signsCost;
        const revenue = glassesSold * (price / 100);
        const profit = revenue - totalCost;
        
        const newState = new GameState(
            this.currentState.currentAssets + (profit * 100), // Convert to cents
            this.currentState.totalProfit + (profit * 100),
            this.currentState.dayCount + 1,
            Math.max(this.currentState.bestDayProfit, profit * 100),
            this.currentState.totalGlassesSold + glassesSold,
            this.currentState.bankruptcyCount + (this.currentState.currentAssets + profit * 100 <= 0 ? 1 : 0)
        );

        // If bankrupt, reset assets to $2.00
        if (newState.currentAssets <= 0) {
            newState.currentAssets = 200; // $2.00 in cents
        }

        try {
            // Generate the proof using your Noir circuit
            // This should be implemented to generate the actual proof
            // and convert it to base64
            const proofBase64 = await this.generateNoirProof({
                previous_state: this.currentState.toNoirInput(),
                final_state: newState.toNoirInput(),
                day_number: dayNumber.toString(),
                glasses_made: glassesMade.toString(),
                signs_made: signsMade.toString(),
                price: price.toString(),
                weather: weather.toString(),
                glasses_sold: glassesSold.toString(),
                random_factor: randomFactor.toString()
            });

            // Generate proof using zkVerify with updated UltraPlonk format
            const { events, transactionResult } = await this.session
                .verify()
                .ultraplonk({
                    numberOfPublicInputs: 6 // number of public inputs in our circuit
                })
                .execute({
                    proofData: {
                        proof: proofBase64,
                        vk: this.vkBase64
                    },
                    domainId: 1 // Using domain 1 for our game proofs
                });

            // Listen for any errors
            events.on('ErrorEvent', (eventData) => {
                console.error('Proof generation error:', eventData);
                throw new Error(`Proof generation failed: ${JSON.stringify(eventData)}`);
            });

            // Wait for the transaction result
            const result = await transactionResult;
            
            // Store proof and update state
            this.dailyProofs.push(result);
            this.currentState = newState;
            
            return {
                success: true,
                proof: result,
                newState
            };
        } catch (error) {
            console.error('Failed to generate proof:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async submitFinalProof() {
        if (this.dailyProofs.length === 0) {
            throw new Error('No daily proofs generated yet');
        }

        try {
            // Submit the final proof to zkVerify testnet
            const { events, transactionResult } = await this.session
                .aggregate(1, this.dailyProofs.length); // Domain 1, using number of proofs as aggregation ID

            // Listen for any errors
            events.on('ErrorEvent', (eventData) => {
                console.error('Proof submission error:', eventData);
                throw new Error(`Proof submission failed: ${JSON.stringify(eventData)}`);
            });

            // Wait for the transaction result
            const result = await transactionResult;
            this.finalProof = result;
            return result;
        } catch (error) {
            console.error('Failed to submit final proof:', error);
            throw error;
        }
    }

    getGameState() {
        return this.currentState;
    }

    getDailyProofs() {
        return this.dailyProofs;
    }

    getFinalProof() {
        return this.finalProof;
    }
}

export default ZkProver; 