import ZkProver from '../zk/proofs/prover';

console.log('game.js module loading...');

class LemonadeStand {
    constructor() {
        console.log('LemonadeStand constructor called');
        
        // Initialize game state
        this.initializeGameState();
        
        // Get DOM elements after a small delay to ensure they exist
        setTimeout(async () => {
            this.initializeDOMElements();
            this.setupEventListeners();
            
            // Initialize ZK prover
            try {
                await this.zkProver.initialize();
                console.log('ZK prover initialized successfully');
            } catch (error) {
                console.error('Failed to initialize ZK prover:', error);
                if (this.proofStatus) {
                    this.proofStatus.textContent = 'Failed to initialize ZK system. Please refresh the page.';
                }
            }
            
            this.startDay();
        }, 0);
    }
    
    initializeGameState() {
        this.assets = 2.00; // Starting money
        this.day = 1;
        this.weather = {
            SUNNY: 'SUNNY',
            CLOUDY: 'CLOUDY',
            HOT_AND_DRY: 'HOT_AND_DRY'
        };
        
        // Initialize game state
        this.currentWeather = this.weather.SUNNY;
        this.weatherProbabilities = {
            [this.weather.SUNNY]: 0.6,
            [this.weather.CLOUDY]: 0.2,
            [this.weather.HOT_AND_DRY]: 0.2
        };
        this.costPerGlass = 0.02; // $0.02 per glass to make
        this.costPerSign = 0.15; // $0.15 per advertising sign
        this.gameState = {
            SETUP: 'SETUP',
            RUNNING: 'RUNNING',
            RESULTS: 'RESULTS',
            GAME_OVER: 'GAME_OVER',
            WIN: 'WIN',
            WIN_CONFIRMED: 'WIN_CONFIRMED'
        };
        this.currentState = this.gameState.SETUP;
        
        // Game statistics
        this.totalProfit = 0;
        this.bestDayProfit = 0;
        this.totalGlassesSold = 0;
        this.bankruptcyDays = 0;
        this.glasses = 0;
        this.signs = 0;
        this.price = 0;
        this.lastDayProfit = 0;
        
        // Previous day's details
        this.lastDayDetails = {
            glasses: 0,
            signs: 0,
            glassesSold: 0,
            price: 0,
            lemonadeCost: 0,
            signsCost: 0,
            revenue: 0,
            profit: 0,
            weather: ''
        };
        
        // Initialize ZK prover
        this.zkProver = new ZkProver();
    }
    
    initializeDOMElements() {
        // Get DOM elements
        this.displayElement = document.getElementById('game-display');
        this.inputElement = document.getElementById('player-input');
        this.proofStatus = document.getElementById('proof-status');
        
        // Check if DOM elements exist
        if (!this.displayElement || !this.inputElement) {
            console.error('Required game elements not found in DOM');
            return;
        }
        
        console.log('DOM elements initialized');
        
        // ASCII art for different weather conditions
        this.weatherArt = {
            [this.weather.SUNNY]: `
    \\   |   /
     \\  |  /
   ___\\_|_/___
      /   \\
     /  |  \\
    /   |   \\`,
            
            [this.weather.CLOUDY]: `
    _.--"""""--._
  .'             '.
 /                 \\
'       .-"-.       '
|      /     \\      |
 \\    |       |    /
  '._ |       | _.'
     '"""""""""'`,
            
            [this.weather.HOT_AND_DRY]: `
   \\  |  /   \\  |  /
    \\ | /     \\ | /
  ___\\|/___  __\\|/__
     /|\\       /|\\
    / | \\     / | \\
   /  |  \\   /  |  \\`
        };
        
        // ASCII art for the stand
        this.standArt = `
   _____________
   |  LEMONADE |
   |    5¢     |
   |___________|
      |     |
   ___| (•) |___
  |  ___°___   |
  | |       |  |
  | |       |  |
  |_|_______|__|`;

        // ASCII art for win screen
        this.winArt = `
   🏆 CONGRATULATIONS! 🏆
      ___________
     '._==_==_=_.'
     .-\\:      /-.
    | (|:.     |) |
     '-|:.     |-'
       \\::.    /
        '::. .'
          ) (
        _.' '._
       \`"""""""\``;

        // ASCII art for bankruptcy
        this.bankruptArt = `
     __________
    /  R.I.P.  \\
   /            \\
  /   LEMONADE   \\
 /      STAND     \\
|                  |
|      $0.00      |
|                  |
|    BANKRUPT!    |
|                  |
|__________________|`;
    }

    setupEventListeners() {
        // Store the bound function so we can remove it later
        this.handleGlobalKeypress = (e) => {
            if (e.key === 'Enter') {
                if (this.currentState === this.gameState.WIN) {
                    // First Enter press just changes state
                    this.currentState = this.gameState.WIN_CONFIRMED;
                    this.displayElement.textContent += '\n\nPress Enter again to start a new game...';
                } else if (this.currentState === this.gameState.WIN_CONFIRMED) {
                    // Reset game instead of creating new instance
                    this.resetGame();
                } else if (this.currentState === this.gameState.GAME_OVER) {
                    if (this.bankruptcyDays >= 2) {
                        // Reset game instead of creating new instance
                        this.resetGame();
                    } else {
                        console.log('Starting next day');
                        this.day++;
                        this.currentState = this.gameState.SETUP;
                        this.startDay();
                        
                        // Clear and focus input field
                        this.inputElement.value = '';
                        this.inputElement.focus();
                    }
                }
            }
        };

        // Add the global keypress listener
        document.addEventListener('keypress', this.handleGlobalKeypress);

        // Clear any existing submitInput handler
        if (window.submitInput) {
            delete window.submitInput;
        }

        // Set up the new submitInput handler
        window.submitInput = () => {
            this.submitInput();
        };
        
        // Remove any existing keypress listener from the input
        this.inputElement.removeEventListener('keypress', this.handleInputKeypress);
        
        // Add the new keypress listener to the input
        this.handleInputKeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitInput();
            }
        };
        this.inputElement.addEventListener('keypress', this.handleInputKeypress);
    }

    resetGame() {
        // Reset all game state variables
        this.assets = 2.00;
        this.day = 1;
        this.currentWeather = this.weather.SUNNY;
        this.currentState = this.gameState.SETUP;
        this.totalProfit = 0;
        this.bestDayProfit = 0;
        this.totalGlassesSold = 0;
        this.bankruptcyDays = 0;
        this.glasses = 0;
        this.signs = 0;
        this.price = 0;
        this.lastDayProfit = 0;
        
        // Reset last day details
        this.lastDayDetails = {
            glasses: 0,
            signs: 0,
            glassesSold: 0,
            price: 0,
            lemonadeCost: 0,
            signsCost: 0,
            revenue: 0,
            profit: 0,
            weather: ''
        };
        
        // Start new game
        this.startDay();
        
        // Clear and focus input field
        this.inputElement.value = '';
        this.inputElement.focus();
    }

    submitInput() {
        console.log('Submit clicked, current state:', this.currentState);
        const inputValue = this.inputElement.value.trim();
        console.log('Input value:', inputValue);
        
        // Skip processing if input is empty
        if (!inputValue) {
            console.log('Empty input, skipping');
            this.inputElement.focus();
            return;
        }
        
        const input = parseInt(inputValue);
        console.log('Parsed input:', input);
        
        if (isNaN(input) || input < 0) {
            alert('Please enter a valid positive number');
            this.inputElement.value = '';
            this.inputElement.focus();
            return;
        }
        
        // Clear input and store value before state transition
        this.inputElement.value = '';
        
        switch (this.currentState) {
            case this.gameState.SETUP:
                if (input * this.costPerGlass > this.assets) {
                    alert('You cannot afford that many glasses!');
                    this.inputElement.focus();
                    return;
                }
                this.glasses = input;
                this.currentState = this.gameState.RUNNING;
                this.displayGameState();
                break;
                
            case this.gameState.RUNNING:
                const totalCost = (this.glasses * this.costPerGlass) + (input * this.costPerSign);
                if (totalCost > this.assets) {
                    alert('You cannot afford that many signs!');
                    this.inputElement.focus();
                    return;
                }
                this.signs = input;
                this.currentState = this.gameState.RESULTS;
                this.displayGameState();
                break;
                
            case this.gameState.RESULTS:
                console.log('Processing price input:', input);
                if (input <= 0) {
                    alert('Price must be greater than 0 cents!');
                    this.inputElement.focus();
                    return;
                }
                this.price = input;  // Store price in cents
                console.log('Price set to:', this.price, 'cents');
                this.runSimulation();
                break;
                
            // Ignore input for other states
            case this.gameState.WIN:
            case this.gameState.WIN_CONFIRMED:
            case this.gameState.GAME_OVER:
                console.log('Ignoring input in state:', this.currentState);
                break;
        }
        
        // Focus input field after processing
        this.inputElement.focus();
    }

    startDay() {
        // Store previous day's assets for profit calculation
        this.previousDayAssets = this.assets;
        
        // Reset from bankruptcy if needed
        if (this.bankruptcyDays > 0 && this.bankruptcyDays < 2) {
            this.assets = 2.00;
        }
        
        // First two days are always sunny (like the original game)
        if (this.day <= 2) {
            this.currentWeather = this.weather.SUNNY;
        } else {
            this.currentWeather = this.generateWeather();
        }
        
        // Ensure we're in SETUP state when starting a new day
        this.currentState = this.gameState.SETUP;
        this.displayGameState();
        
        // Focus the input field
        this.inputElement.value = '';
        this.inputElement.focus();
    }

    generateWeather() {
        const rand = Math.random();
        let cumProb = 0;
        for (const [weather, prob] of Object.entries(this.weatherProbabilities)) {
            cumProb += prob;
            if (rand < cumProb) return weather;
        }
        return this.weather.SUNNY;
    }

    calculateDemand(glasses, signs, priceInDollars) {
        // Convert price to cents for calculation
        const priceInCents = Math.floor(priceInDollars * 100);
        
        // Base demand calculation based on price
        let baseDemand;
        if (priceInCents < 25) {
            // For prices under $0.25, use linear demand
            baseDemand = Math.max(0, 30 - ((priceInCents * 120) / 100));
        } else {
            // For higher prices, use logarithmic falloff
            const priceFactor = priceInCents / 25; // Normalize to $0.25 units
            baseDemand = Math.floor(30 / (1 + Math.log2(priceFactor)));
        }
        
        // Sign effect - progressive bonus based on number of signs
        let signEffect = 0;
        if (signs > 0) {
            if (signs <= 2) signEffect = 15;
            else if (signs <= 4) signEffect = 25;
            else if (signs <= 8) signEffect = 35;
            else signEffect = 40;
            
            signEffect = Math.floor((baseDemand * signEffect) / 100);
        }
        
        // Weather effects
        let weatherMultiplier;
        switch(this.currentWeather) {
            case this.weather.HOT_AND_DRY:
                weatherMultiplier = 200; // 2.0x
                break;
            case this.weather.SUNNY:
                weatherMultiplier = 120; // 1.2x
                break;
            case this.weather.CLOUDY:
                weatherMultiplier = 60;  // 0.6x
                break;
            default:
                weatherMultiplier = 100; // 1.0x
        }
        
        // Random factor is now handled in runSimulation (60-140%)
        // We'll use it from lastDayDetails
        const randomFactor = this.lastDayDetails?.randomFactor || 100;
        
        // Calculate final demand
        const totalDemand = Math.floor(((baseDemand + signEffect) * weatherMultiplier * randomFactor) / 10000);
        
        // Return the minimum of calculated demand and available glasses
        return Math.min(totalDemand, glasses);
    }

    displayGameState() {
        let display = '';
        
        // Clear proof status except for RESULTS state
        if (this.currentState !== this.gameState.RESULTS && this.proofStatus) {
            this.proofStatus.textContent = '';
        }
        
        switch (this.currentState) {
            case this.gameState.SETUP:
                // Show previous day's results if not day 1
                let previousDayInfo = '';
                if (this.day > 1) {
                    previousDayInfo = `\nYESTERDAY'S FINANCIAL REPORT:
Weather: ${this.lastDayDetails.weather}
Glasses Made: ${this.lastDayDetails.glasses} @ $${this.costPerGlass.toFixed(2)} = $${this.lastDayDetails.lemonadeCost.toFixed(2)}
Signs Made: ${this.lastDayDetails.signs} @ $${this.costPerSign.toFixed(2)} = $${this.lastDayDetails.signsCost.toFixed(2)}
Total Expenses: $${(this.lastDayDetails.lemonadeCost + this.lastDayDetails.signsCost).toFixed(2)}

Glasses Sold: ${this.lastDayDetails.glassesSold} @ $${this.lastDayDetails.price.toFixed(2)}
Revenue: $${this.lastDayDetails.revenue.toFixed(2)}

Net Profit/Loss: ${this.lastDayDetails.profit >= 0 ? '+' : ''}$${this.lastDayDetails.profit.toFixed(2)}`;
                }

                display = `
*** LEMONADE STAND ***
${this.standArt}

DAY ${this.day}
ASSETS: $${this.assets.toFixed(2)}${previousDayInfo}

WEATHER REPORT: ${this.currentWeather.replace(/_/g, ' ')}
${this.weatherArt[this.currentWeather]}

COST OF LEMONADE: $${this.costPerGlass.toFixed(2)}/GLASS
COST OF SIGNS: $${this.costPerSign.toFixed(2)}/SIGN

GAME PROGRESS:
Total Profit: $${this.totalProfit.toFixed(2)}
Best Day: $${this.bestDayProfit.toFixed(2)}
Total Sales: ${this.totalGlassesSold} glasses

HOW MANY GLASSES OF LEMONADE DO YOU WISH TO MAKE?`;
                break;
                
            case this.gameState.RUNNING:
                display = `
ASSETS: $${this.assets.toFixed(2)}
GLASSES TO MAKE: ${this.glasses}

HOW MANY ADVERTISING SIGNS DO YOU WANT TO MAKE?`;
                break;
                
            case this.gameState.RESULTS:
                display = `
ASSETS: $${this.assets.toFixed(2)}
GLASSES TO MAKE: ${this.glasses}
SIGNS TO MAKE: ${this.signs}

HOW MUCH DO YOU WISH TO CHARGE FOR LEMONADE (CENTS)?`;
                break;

            case this.gameState.WIN:
                display = `${this.winArt}

You've mastered the art of running a lemonade stand!

FINAL STATISTICS:
----------------
Days in Business:   ${this.day}
Final Assets:       $${this.assets.toFixed(2)}
Total Profit:       $${this.totalProfit.toFixed(2)}
Best Day Profit:    $${this.bestDayProfit.toFixed(2)}
Total Sales:        ${this.totalGlassesSold} glasses

${this.assets >= 100.00 ? "You reached $100 in assets!" : "You survived 30 days!"}

Press Enter to start a new game...`;
                break;

            case this.gameState.GAME_OVER:
                if (this.bankruptcyDays >= 2) {
                    display = `${this.bankruptArt}

GAME OVER! You went bankrupt twice.
Final Score: $${this.totalProfit.toFixed(2)}

Press Enter to start a new game...`;
                }
                break;
        }
        
        this.displayElement.textContent = display;
        this.inputElement.value = '';
        this.inputElement.focus();
    }

    async runSimulation() {
        if (this.currentState !== this.gameState.RESULTS) {
            console.error('Cannot run simulation: game is not in RESULTS state');
            return;
        }

        // Get current inputs
        const glasses = parseInt(this.glasses);
        const signs = parseInt(this.signs);
        const priceInCents = parseInt(this.price);  // Price is stored in cents

        // Validate inputs
        if (isNaN(glasses) || isNaN(signs) || isNaN(priceInCents)) {
            this.displayElement.textContent = 'Please enter valid numbers for all inputs.';
            return;
        }

        // Calculate costs
        const lemonadeCost = glasses * 0.02;
        const signsCost = signs * 0.15;
        const totalCost = lemonadeCost + signsCost;

        // Check if player can afford the costs
        if (totalCost > this.assets) {
            this.displayElement.textContent = `You don't have enough money! Total cost: $${totalCost.toFixed(2)}`;
            return;
        }

        try {
            // Generate random demand factor (60-140%)
            const randomFactor = Math.floor(60 + Math.random() * 81); // Random factor between 60 and 140

            // Calculate demand and sales
            const priceInDollars = priceInCents / 100;  // Convert cents to dollars for demand calculation
            const glassesSold = this.calculateDemand(glasses, signs, priceInDollars);

            // Generate ZK proof for this day's results
            const proofResult = await this.zkProver.generateDailyProof(
                this.day,
                glasses,
                signs,
                priceInCents,  // Pass price in cents to proof
                this.weatherToNumber(this.currentWeather),
                glassesSold,
                randomFactor
            );

            if (!proofResult.success) {
                console.warn('Could not generate proof:', proofResult.error);
                // Continue with game but warn user
                if (this.proofStatus) {
                    this.proofStatus.textContent = 'Warning: Could not verify this day\'s results with zero-knowledge proof.';
                }
            }

            // Calculate revenue and profit using price in dollars
            const revenue = glassesSold * priceInDollars;
            const profit = revenue - totalCost;

            // Update game statistics
            this.totalProfit += profit;
            this.bestDayProfit = Math.max(this.bestDayProfit, profit);
            this.totalGlassesSold += glassesSold;
            this.assets += profit;

            // Store last day's details
            this.lastDayDetails = {
                glasses,
                signs,
                glassesSold,
                price: priceInDollars,  // Store price in dollars for display
                lemonadeCost,
                signsCost,
                revenue,
                profit,
                weather: this.currentWeather,
                randomFactor // Store random factor for debugging
            };

            // Check for bankruptcy
            if (this.assets <= 0) {
                this.bankruptcyDays++;
                this.assets = 2.00; // Reset to starting amount
                this.currentState = this.gameState.GAME_OVER;
            } else if (this.assets >= 100.00 || this.day >= 30) {
                // Check for win condition (either $100 or 30 days)
                this.currentState = this.gameState.WIN;
                
                // Generate final proof
                const finalProofResult = await this.zkProver.submitFinalProof();
                if (!finalProofResult.success) {
                    console.warn('Could not generate final proof:', finalProofResult.error);
                    if (this.proofStatus) {
                        this.proofStatus.textContent = 'Warning: Could not verify final game state with zero-knowledge proof.';
                    }
                }
            } else {
                // Move to next day
                this.day++;
                this.currentState = this.gameState.SETUP;
            }

            // Display updated game state
            await this.displayGameState();

        } catch (error) {
            console.error('Error during simulation:', error);
            this.displayElement.textContent = 'An error occurred during the simulation. Please try again.';
        }
    }

    weatherToNumber(weather) {
        switch (weather) {
            case this.weather.CLOUDY:
                return 0;
            case this.weather.SUNNY:
                return 1;
            case this.weather.HOT_AND_DRY:
                return 2;
            default:
                return 0;
        }
    }
}

// Export the LemonadeStand class
console.log('Exporting LemonadeStand class...');
export { LemonadeStand };
export const TEST = 'test-export';

// Remove window assignments since we're using proper module exports
// window.onload = () => {
//     window.game = new LemonadeStand();
//     window.gameLoaded = true;
// }; 