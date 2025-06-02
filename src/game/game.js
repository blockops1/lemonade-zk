class LemonadeStand {
    constructor() {
        this.assets = 2.00; // Starting money
        this.day = 1;
        this.weather = {
            SUNNY: 'SUNNY',
            CLOUDY: 'CLOUDY',
            HOT_AND_DRY: 'HOT_AND_DRY'
        };
        
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
            WIN_CONFIRMED: 'WIN_CONFIRMED'  // New state for confirmed win
        };
        this.currentState = this.gameState.SETUP;
        this.displayElement = document.getElementById('game-display');
        this.inputElement = document.getElementById('player-input');
        
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
        
        // Remove global event listener before adding a new one
        document.removeEventListener('keypress', this.handleGlobalKeypress);
        
        this.setupEventListeners();
        this.startDay();
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
                    // Second Enter press starts new game
                    // Remove existing event listeners before creating new game
                    document.removeEventListener('keypress', this.handleGlobalKeypress);
                    this.inputElement.removeEventListener('keypress', this.handleInputKeypress);
                    
                    const newGame = new LemonadeStand();
                    window.game = newGame;
                    
                    // Explicitly set initial state and start the game
                    newGame.currentState = newGame.gameState.SETUP;
                    newGame.startDay();
                    
                    // Clear and focus input field
                    newGame.inputElement.value = '';
                    newGame.inputElement.focus();
                } else if (this.currentState === this.gameState.GAME_OVER) {
                    if (this.bankruptcyDays >= 2) {
                        // Remove existing event listeners before creating new game
                        document.removeEventListener('keypress', this.handleGlobalKeypress);
                        this.inputElement.removeEventListener('keypress', this.handleInputKeypress);
                        
                        const newGame = new LemonadeStand();
                        window.game = newGame;
                        
                        // Explicitly set initial state and start the game
                        newGame.currentState = newGame.gameState.SETUP;
                        newGame.startDay();
                        
                        // Clear and focus input field
                        newGame.inputElement.value = '';
                        newGame.inputElement.focus();
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
                    this.price = input / 100;
                    console.log('Price set to:', this.price);
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
        };
        
        // Remove any existing keypress listener from the input
        this.inputElement.removeEventListener('keypress', this.handleInputKeypress);
        
        // Add the new keypress listener to the input
        this.handleInputKeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.submitInput();
            }
        };
        this.inputElement.addEventListener('keypress', this.handleInputKeypress);
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
        // Base demand calculation based on price
        // More punishing price sensitivity curve
        // Price is in dollars, so 0.25 = 25 cents
        let n1;
        if (priceInDollars < 0.25) {
            n1 = Math.max(0, 30 - (120 * priceInDollars)); // Steeper decline
        } else {
            n1 = Math.max(0, 4 / (priceInDollars * priceInDollars)); // Sharper dropoff
        }
        
        // Weather effects
        let weatherMultiplier;
        switch(this.currentWeather) {
            case this.weather.HOT_AND_DRY:
                weatherMultiplier = 1.5;  // Very good for business
                break;
            case this.weather.SUNNY:
                weatherMultiplier = 1.0;  // Normal conditions
                break;
            case this.weather.CLOUDY:
                weatherMultiplier = 0.4;  // Really bad for business
                break;
            default:
                weatherMultiplier = 1.0;
        }
        
        // Advertising has diminishing returns and can be wasteful
        // First few signs are effective, then drops off sharply
        let signEffect = signs > 0 ? 1 + (Math.log(signs) * 0.15) : 1;
        
        // Random factor (weather-dependent variance)
        let randomFactor = 0.6 + (Math.random() * 0.8); // 0.6 to 1.4
        
        // Calculate final demand
        let demand = Math.floor(n1 * weatherMultiplier * signEffect * randomFactor);
        
        // Ensure demand is never negative
        demand = Math.max(0, demand);
        
        // Return the minimum of calculated demand and available glasses
        return Math.min(demand, glasses);
    }

    displayGameState() {
        let display = '';
        
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

    runSimulation() {
        const startingAssets = this.assets;
        const lemonadeCost = this.glasses * this.costPerGlass;
        const signsCost = this.signs * this.costPerSign;
        const totalExpenses = lemonadeCost + signsCost;
        const glassesSold = this.calculateDemand(this.glasses, this.signs, this.price);
        const revenue = glassesSold * this.price;
        const profit = revenue - totalExpenses;
        const unsoldGlasses = this.glasses - glassesSold;
        
        // Store all details for next day's display
        this.lastDayDetails = {
            glasses: this.glasses,
            signs: this.signs,
            glassesSold: glassesSold,
            price: this.price,
            lemonadeCost: lemonadeCost,
            signsCost: signsCost,
            revenue: revenue,
            profit: profit,
            weather: this.currentWeather
        };
        this.lastDayProfit = profit;
        
        // Add some console logging to help debug
        console.log('Daily financial report:', this.lastDayDetails);
        
        // Update game statistics
        this.totalProfit += profit;
        this.bestDayProfit = Math.max(this.bestDayProfit, profit);
        this.totalGlassesSold += glassesSold;
        this.assets += profit;

        let resultDisplay = `
*** DAY ${this.day} RESULTS ***

DETAILED FINANCIAL REPORT:
------------------------
Starting Assets:     $${startingAssets.toFixed(2)}

EXPENSES:
  Lemonade (${this.glasses} glasses @ $${this.costPerGlass.toFixed(2)}/glass):  $${lemonadeCost.toFixed(2)}
  Signs (${this.signs} signs @ $${this.costPerSign.toFixed(2)}/sign):      $${signsCost.toFixed(2)}
  Total Expenses:    $${totalExpenses.toFixed(2)}

SALES:
  Price per Glass:   $${this.price.toFixed(2)}
  Glasses Made:      ${this.glasses}
  Glasses Sold:      ${glassesSold}
  Glasses Unsold:    ${unsoldGlasses}
  
REVENUE:
  Gross Revenue:     $${revenue.toFixed(2)}
  Net Profit:        $${profit.toFixed(2)}

SUMMARY:
  Starting Assets:   $${startingAssets.toFixed(2)}
  Change in Assets:  ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}
  Ending Assets:     $${this.assets.toFixed(2)}

GAME STATISTICS:
  Total Days:        ${this.day}
  Total Profit:      $${this.totalProfit.toFixed(2)}
  Best Day Profit:   $${this.bestDayProfit.toFixed(2)}
  Total Glasses Sold: ${this.totalGlassesSold}
`;

        // Check win/lose conditions
        if (this.assets <= 0) {
            this.bankruptcyDays++;
            if (this.bankruptcyDays >= 2) {
                this.currentState = this.gameState.GAME_OVER;
                resultDisplay += '\n\nGAME OVER! You went bankrupt twice. Final Score: $' + this.totalProfit.toFixed(2);
                resultDisplay += '\n\nPress Enter to start a new game...';
            } else {
                resultDisplay += '\n\nBANKRUPTCY! But you get another chance with $2.00';
                this.assets = 2.00;
                this.currentState = this.gameState.GAME_OVER;
                resultDisplay += '\n\nPress Enter to continue with $2.00...';
            }
        } else if (this.assets >= 100.00 || this.day >= 30) {
            this.currentState = this.gameState.WIN;
            resultDisplay = `
*** CONGRATULATIONS! ***

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
        } else {
            this.currentState = this.gameState.GAME_OVER;
            resultDisplay += '\n\nPress Enter to continue to Day ' + (this.day + 1);
        }
        
        this.displayElement.textContent = resultDisplay;
        this.inputElement.value = '';
    }
}

// Export the LemonadeStand class
window.LemonadeStand = LemonadeStand;

// Remove the automatic initialization since we're handling it in HTML
// window.onload = () => {
//     window.game = new LemonadeStand();
//     window.gameLoaded = true;
// }; 