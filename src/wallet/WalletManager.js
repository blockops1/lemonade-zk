import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

class WalletManager {
    constructor() {
        console.log('WalletManager: Initializing...');
        this.accounts = [];
        this.selectedAccount = null;
        this.isConnected = false;
        this.onAccountsChanged = null;
        
        // Get UI elements
        this.walletIcon = document.getElementById('wallet-icon');
        this.walletPopup = document.getElementById('wallet-popup');
        this.statusElement = document.getElementById('wallet-status');
        this.accountSelectElement = document.getElementById('account-select');
        this.connectButtonElement = document.getElementById('connect-wallet');
        
        console.log('WalletManager: UI elements initialized:', {
            walletIcon: !!this.walletIcon,
            walletPopup: !!this.walletPopup,
            statusElement: !!this.statusElement,
            accountSelect: !!this.accountSelectElement,
            connectButton: !!this.connectButtonElement
        });
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('WalletManager: Setting up event listeners...');
        
        if (this.walletIcon) {
            this.walletIcon.addEventListener('click', (e) => {
                console.log('WalletManager: Wallet icon clicked');
                e.stopPropagation();
                this.toggleWalletPopup();
            });
        }
        
        if (this.connectButtonElement) {
            console.log('WalletManager: Adding connect button listener');
            this.connectButtonElement.addEventListener('click', async (e) => {
                console.log('WalletManager: Connect button clicked');
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (!this.isConnected) {
                        console.log('WalletManager: Attempting to connect...');
                        await this.connect();
                    } else {
                        console.log('WalletManager: Attempting to disconnect...');
                        await this.disconnect();
                    }
                } catch (error) {
                    console.error('WalletManager: Connection error:', error);
                    this.updateStatus('Error: ' + error.message);
                }
            });
        }

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.wallet-container')) {
                if (this.walletPopup && this.walletPopup.classList.contains('show')) {
                    console.log('WalletManager: Closing popup from outside click');
                    this.walletPopup.classList.remove('show');
                }
            }
        });
    }

    async connect() {
        console.log('WalletManager: Starting wallet connection...');
        try {
            const extensions = await web3Enable('Lemonade Stand Game');
            console.log('WalletManager: Extensions found:', extensions.map(ext => ext.name));
            
            if (extensions.length === 0) {
                throw new Error('No wallet extension found. Please install SubWallet or Polkadot.js extension.');
            }

            const allAccounts = await web3Accounts();
            console.log('WalletManager: Accounts found:', allAccounts.length);
            
            if (allAccounts.length === 0) {
                throw new Error('No accounts found. Please create an account in your wallet.');
            }

            this.accounts = allAccounts;
            this.selectedAccount = this.accounts[0];
            this.isConnected = true;
            
            this.updateAccountSelect();
            this.updateStatus('Connected: ' + this.selectedAccount.address);
            this.updateWalletIcon();
            this.updateConnectButton();
            
            return true;
        } catch (error) {
            console.error('WalletManager: Connection error:', error);
            this.updateStatus('Error: ' + error.message);
            throw error;
        }
    }

    async disconnect() {
        console.log('WalletManager: Disconnecting wallet...');
        this.accounts = [];
        this.selectedAccount = null;
        this.isConnected = false;
        
        this.updateAccountSelect();
        this.updateStatus('Wallet not connected');
        this.updateWalletIcon();
        this.updateConnectButton();
    }

    toggleWalletPopup() {
        if (this.walletPopup) {
            const isVisible = this.walletPopup.classList.contains('show');
            console.log('WalletManager: Toggling popup visibility from', isVisible, 'to', !isVisible);
            this.walletPopup.classList.toggle('show');
        }
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    updateWalletIcon() {
        if (this.walletIcon) {
            this.walletIcon.classList.toggle('connected', this.isConnected);
            this.walletIcon.classList.toggle('error', false);
        }
    }

    updateConnectButton() {
        if (this.connectButtonElement) {
            this.connectButtonElement.textContent = this.isConnected ? 'Disconnect' : 'Connect Wallet';
        }
    }

    updateAccountSelect() {
        if (!this.accountSelectElement) return;
        
        this.accountSelectElement.innerHTML = '';
        this.accountSelectElement.style.display = this.accounts.length > 0 ? 'block' : 'none';
        
        this.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.address;
            option.textContent = `${account.meta.name} (${account.address.slice(0, 6)}...${account.address.slice(-4)})`;
            this.accountSelectElement.appendChild(option);
        });
    }

    async initialize() {
        console.log('WalletManager: Initialization complete');
        this.updateStatus('Wallet not connected');
        this.updateWalletIcon();
        this.updateConnectButton();
        return true;
    }
}

export default WalletManager; 