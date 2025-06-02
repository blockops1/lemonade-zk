self["webpackHotUpdatelemonade_zk"]("main",{

/***/ "./src/game/game.js":
/*!**************************!*\
  !*** ./src/game/game.js ***!
  \**************************/
/***/ (() => {

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var LemonadeStand = /*#__PURE__*/function () {
  function LemonadeStand() {
    _classCallCheck(this, LemonadeStand);
    this.assets = 2.00; // Starting money
    this.day = 1;
    this.weather = {
      SUNNY: 'SUNNY',
      CLOUDY: 'CLOUDY',
      HOT_AND_DRY: 'HOT_AND_DRY'
    };
    this.currentWeather = this.weather.SUNNY;
    this.weatherProbabilities = _defineProperty(_defineProperty(_defineProperty({}, this.weather.SUNNY, 0.6), this.weather.CLOUDY, 0.2), this.weather.HOT_AND_DRY, 0.2);
    this.costPerGlass = 0.02; // $0.02 per glass to make
    this.costPerSign = 0.15; // $0.15 per advertising sign
    this.gameState = {
      SETUP: 'SETUP',
      RUNNING: 'RUNNING',
      RESULTS: 'RESULTS',
      GAME_OVER: 'GAME_OVER',
      WIN: 'WIN',
      WIN_CONFIRMED: 'WIN_CONFIRMED' // New state for confirmed win
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

    // Remove global event listener before adding a new one
    document.removeEventListener('keypress', this.handleGlobalKeypress);
    this.setupEventListeners();
    this.startDay();
  }
  return _createClass(LemonadeStand, [{
    key: "setupEventListeners",
    value: function setupEventListeners() {
      var _this = this;
      // Store the bound function so we can remove it later
      this.handleGlobalKeypress = function (e) {
        if (e.key === 'Enter') {
          if (_this.currentState === _this.gameState.WIN) {
            // First Enter press just changes state
            _this.currentState = _this.gameState.WIN_CONFIRMED;
            _this.displayElement.textContent += '\n\nPress Enter again to start a new game...';
          } else if (_this.currentState === _this.gameState.WIN_CONFIRMED) {
            // Second Enter press starts new game
            // Remove existing event listeners before creating new game
            document.removeEventListener('keypress', _this.handleGlobalKeypress);
            _this.inputElement.removeEventListener('keypress', _this.handleInputKeypress);
            var newGame = new LemonadeStand();
            window.game = newGame;

            // Explicitly set initial state and start the game
            newGame.currentState = newGame.gameState.SETUP;
            newGame.startDay();

            // Clear and focus input field
            newGame.inputElement.value = '';
            newGame.inputElement.focus();
          } else if (_this.currentState === _this.gameState.GAME_OVER) {
            if (_this.bankruptcyDays >= 2) {
              // Remove existing event listeners before creating new game
              document.removeEventListener('keypress', _this.handleGlobalKeypress);
              _this.inputElement.removeEventListener('keypress', _this.handleInputKeypress);
              var _newGame = new LemonadeStand();
              window.game = _newGame;

              // Explicitly set initial state and start the game
              _newGame.currentState = _newGame.gameState.SETUP;
              _newGame.startDay();

              // Clear and focus input field
              _newGame.inputElement.value = '';
              _newGame.inputElement.focus();
            } else {
              console.log('Starting next day');
              _this.day++;
              _this.currentState = _this.gameState.SETUP;
              _this.startDay();

              // Clear and focus input field
              _this.inputElement.value = '';
              _this.inputElement.focus();
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
      window.submitInput = function () {
        console.log('Submit clicked, current state:', _this.currentState);
        var inputValue = _this.inputElement.value.trim();
        console.log('Input value:', inputValue);

        // Skip processing if input is empty
        if (!inputValue) {
          console.log('Empty input, skipping');
          _this.inputElement.focus();
          return;
        }
        var input = parseInt(inputValue);
        console.log('Parsed input:', input);
        if (isNaN(input) || input < 0) {
          alert('Please enter a valid positive number');
          _this.inputElement.value = '';
          _this.inputElement.focus();
          return;
        }

        // Clear input and store value before state transition
        _this.inputElement.value = '';
        switch (_this.currentState) {
          case _this.gameState.SETUP:
            if (input * _this.costPerGlass > _this.assets) {
              alert('You cannot afford that many glasses!');
              _this.inputElement.focus();
              return;
            }
            _this.glasses = input;
            _this.currentState = _this.gameState.RUNNING;
            _this.displayGameState();
            break;
          case _this.gameState.RUNNING:
            var totalCost = _this.glasses * _this.costPerGlass + input * _this.costPerSign;
            if (totalCost > _this.assets) {
              alert('You cannot afford that many signs!');
              _this.inputElement.focus();
              return;
            }
            _this.signs = input;
            _this.currentState = _this.gameState.RESULTS;
            _this.displayGameState();
            break;
          case _this.gameState.RESULTS:
            console.log('Processing price input:', input);
            if (input <= 0) {
              alert('Price must be greater than 0 cents!');
              _this.inputElement.focus();
              return;
            }
            _this.price = input / 100;
            console.log('Price set to:', _this.price);
            _this.runSimulation();
            break;

          // Ignore input for other states
          case _this.gameState.WIN:
          case _this.gameState.WIN_CONFIRMED:
          case _this.gameState.GAME_OVER:
            console.log('Ignoring input in state:', _this.currentState);
            break;
        }

        // Focus input field after processing
        _this.inputElement.focus();
      };

      // Remove any existing keypress listener from the input
      this.inputElement.removeEventListener('keypress', this.handleInputKeypress);

      // Add the new keypress listener to the input
      this.handleInputKeypress = function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.submitInput();
        }
      };
      this.inputElement.addEventListener('keypress', this.handleInputKeypress);
    }
  }, {
    key: "startDay",
    value: function startDay() {
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
  }, {
    key: "generateWeather",
    value: function generateWeather() {
      var rand = Math.random();
      var cumProb = 0;
      for (var _i = 0, _Object$entries = Object.entries(this.weatherProbabilities); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          weather = _Object$entries$_i[0],
          prob = _Object$entries$_i[1];
        cumProb += prob;
        if (rand < cumProb) return weather;
      }
      return this.weather.SUNNY;
    }
  }, {
    key: "calculateDemand",
    value: function calculateDemand(glasses, signs, priceInDollars) {
      // Base demand calculation based on price
      // More punishing price sensitivity curve
      // Price is in dollars, so 0.25 = 25 cents
      var n1;
      if (priceInDollars < 0.25) {
        n1 = Math.max(0, 30 - 120 * priceInDollars); // Steeper decline
      } else {
        n1 = Math.max(0, 4 / (priceInDollars * priceInDollars)); // Sharper dropoff
      }

      // Weather effects
      var weatherMultiplier;
      switch (this.currentWeather) {
        case this.weather.HOT_AND_DRY:
          weatherMultiplier = 1.5; // Very good for business
          break;
        case this.weather.SUNNY:
          weatherMultiplier = 1.0; // Normal conditions
          break;
        case this.weather.CLOUDY:
          weatherMultiplier = 0.4; // Really bad for business
          break;
        default:
          weatherMultiplier = 1.0;
      }

      // Advertising has diminishing returns and can be wasteful
      // First few signs are effective, then drops off sharply
      var signEffect = signs > 0 ? 1 + Math.log(signs) * 0.15 : 1;

      // Random factor (weather-dependent variance)
      var randomFactor = 0.6 + Math.random() * 0.8; // 0.6 to 1.4

      // Calculate final demand
      var demand = Math.floor(n1 * weatherMultiplier * signEffect * randomFactor);

      // Ensure demand is never negative
      demand = Math.max(0, demand);

      // Return the minimum of calculated demand and available glasses
      return Math.min(demand, glasses);
    }
  }, {
    key: "displayGameState",
    value: function displayGameState() {
      var display = '';
      switch (this.currentState) {
        case this.gameState.SETUP:
          display = "\n*** LEMONADE STAND ***\n\nDAY ".concat(this.day, "\nASSETS: $").concat(this.assets.toFixed(2), "\n\nWEATHER REPORT: ").concat(this.currentWeather.replace(/_/g, ' '), "\n\nCOST OF LEMONADE: $").concat(this.costPerGlass.toFixed(2), "/GLASS\nCOST OF SIGNS: $").concat(this.costPerSign.toFixed(2), "/SIGN\n\nGAME PROGRESS:\nTotal Profit: $").concat(this.totalProfit.toFixed(2), "\nBest Day: $").concat(this.bestDayProfit.toFixed(2), "\nTotal Sales: ").concat(this.totalGlassesSold, " glasses\n\nHOW MANY GLASSES OF LEMONADE DO YOU WISH TO MAKE?");
          break;
        case this.gameState.RUNNING:
          display = "\nASSETS: $".concat(this.assets.toFixed(2), "\nGLASSES TO MAKE: ").concat(this.glasses, "\n\nHOW MANY ADVERTISING SIGNS DO YOU WANT TO MAKE?");
          break;
        case this.gameState.RESULTS:
          display = "\nASSETS: $".concat(this.assets.toFixed(2), "\nGLASSES TO MAKE: ").concat(this.glasses, "\nSIGNS TO MAKE: ").concat(this.signs, "\n\nHOW MUCH DO YOU WISH TO CHARGE FOR LEMONADE (CENTS)?");
          break;
        case this.gameState.WIN:
          display = "\n*** CONGRATULATIONS! ***\n\nYou've mastered the art of running a lemonade stand!\n\nFINAL STATISTICS:\n----------------\nDays in Business:   ".concat(this.day, "\nFinal Assets:       $").concat(this.assets.toFixed(2), "\nTotal Profit:       $").concat(this.totalProfit.toFixed(2), "\nBest Day Profit:    $").concat(this.bestDayProfit.toFixed(2), "\nTotal Sales:        ").concat(this.totalGlassesSold, " glasses\n\n").concat(this.assets >= 100.00 ? "You reached $100 in assets!" : "You survived 30 days!", "\n\nPress Enter to start a new game...");
          break;
      }
      this.displayElement.textContent = display;
      this.inputElement.value = '';
      this.inputElement.focus();
    }
  }, {
    key: "runSimulation",
    value: function runSimulation() {
      var startingAssets = this.assets;
      var lemonadeCost = this.glasses * this.costPerGlass;
      var signsCost = this.signs * this.costPerSign;
      var totalExpenses = lemonadeCost + signsCost;
      var glassesSold = this.calculateDemand(this.glasses, this.signs, this.price);
      var revenue = glassesSold * this.price;
      var profit = revenue - totalExpenses;
      var unsoldGlasses = this.glasses - glassesSold;

      // Add some console logging to help debug
      console.log('Daily financial report:', {
        glassesMade: this.glasses,
        glassesSold: glassesSold,
        pricePerGlass: this.price,
        revenue: revenue,
        lemonadeCost: lemonadeCost,
        signsCost: signsCost,
        totalExpenses: totalExpenses,
        profit: profit,
        weather: this.currentWeather
      });

      // Update game statistics
      this.totalProfit += profit;
      this.bestDayProfit = Math.max(this.bestDayProfit, profit);
      this.totalGlassesSold += glassesSold;
      this.assets += profit;
      var resultDisplay = "\n*** DAY ".concat(this.day, " RESULTS ***\n\nDETAILED FINANCIAL REPORT:\n------------------------\nStarting Assets:     $").concat(startingAssets.toFixed(2), "\n\nEXPENSES:\n  Lemonade (").concat(this.glasses, " glasses @ $").concat(this.costPerGlass.toFixed(2), "/glass):  $").concat(lemonadeCost.toFixed(2), "\n  Signs (").concat(this.signs, " signs @ $").concat(this.costPerSign.toFixed(2), "/sign):      $").concat(signsCost.toFixed(2), "\n  Total Expenses:    $").concat(totalExpenses.toFixed(2), "\n\nSALES:\n  Price per Glass:   $").concat(this.price.toFixed(2), "\n  Glasses Made:      ").concat(this.glasses, "\n  Glasses Sold:      ").concat(glassesSold, "\n  Glasses Unsold:    ").concat(unsoldGlasses, "\n  \nREVENUE:\n  Gross Revenue:     $").concat(revenue.toFixed(2), "\n  Net Profit:        $").concat(profit.toFixed(2), "\n\nSUMMARY:\n  Starting Assets:   $").concat(startingAssets.toFixed(2), "\n  Change in Assets:  ").concat(profit >= 0 ? '+' : '', "$").concat(profit.toFixed(2), "\n  Ending Assets:     $").concat(this.assets.toFixed(2), "\n\nGAME STATISTICS:\n  Total Days:        ").concat(this.day, "\n  Total Profit:      $").concat(this.totalProfit.toFixed(2), "\n  Best Day Profit:   $").concat(this.bestDayProfit.toFixed(2), "\n  Total Glasses Sold: ").concat(this.totalGlassesSold, "\n");

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
        resultDisplay = "\n*** CONGRATULATIONS! ***\n\nYou've mastered the art of running a lemonade stand!\n\nFINAL STATISTICS:\n----------------\nDays in Business:   ".concat(this.day, "\nFinal Assets:       $").concat(this.assets.toFixed(2), "\nTotal Profit:       $").concat(this.totalProfit.toFixed(2), "\nBest Day Profit:    $").concat(this.bestDayProfit.toFixed(2), "\nTotal Sales:        ").concat(this.totalGlassesSold, " glasses\n\n").concat(this.assets >= 100.00 ? "You reached $100 in assets!" : "You survived 30 days!", "\n\nPress Enter to start a new game...");
      } else {
        this.currentState = this.gameState.GAME_OVER;
        resultDisplay += '\n\nPress Enter to continue to Day ' + (this.day + 1);
      }
      this.displayElement.textContent = resultDisplay;
      this.inputElement.value = '';
    }
  }]);
}(); // Export the LemonadeStand class
window.LemonadeStand = LemonadeStand;

// Remove the automatic initialization since we're handling it in HTML
// window.onload = () => {
//     window.game = new LemonadeStand();
//     window.gameLoaded = true;
// };

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("47c5eb4b6368689fec19")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.7c2068b03d108d1224fe.hot-update.js.map