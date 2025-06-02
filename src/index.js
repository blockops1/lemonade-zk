import { LemonadeStand } from './game/game';
import WalletManager from './wallet/WalletManager';

let game = null;
let walletManager = null;

// Initialize game and wallet when the DOM is loaded
const initialize = async () => {
    console.log('Initializing application...');
    
    try {
        // Initialize wallet first
        if (!walletManager) {
            walletManager = new WalletManager();
            await walletManager.initialize();
            window.walletManager = walletManager;
            console.log('Wallet manager initialized');
        }
        
        // Initialize game
        if (!game) {
            game = new LemonadeStand();
            window.game = game;
            console.log('Game initialized');
        }
        
        // Set up global handlers
        window.submitInput = () => {
            if (game) {
                game.submitInput();
            } else {
                console.error('Game not initialized');
            }
        };
        
        window.connectWallet = async () => {
            if (walletManager) {
                try {
                    await walletManager.connect();
                } catch (error) {
                    console.error('Error connecting wallet:', error);
                }
            } else {
                console.error('Wallet manager not initialized');
            }
        };
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
};

// Handle hot module replacement
if (module.hot) {
    module.hot.accept('./game/game', () => {
        console.log('Hot reloading game module');
        const oldGame = game;
        game = new LemonadeStand();
        window.game = game;
        
        // Transfer state if needed
        if (oldGame) {
            // Add any state transfer logic here if needed
            console.log('Transferred game state');
        }
    });
    
    module.hot.accept('./wallet/WalletManager', () => {
        console.log('Hot reloading wallet module');
        // Wallet manager state should persist through localStorage
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 