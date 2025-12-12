# Example Environment Variables

# ============================================
# NETWORK CONFIGURATION
# ============================================

# Set to 'true' to use local Hardhat, 'false' or remove to use Sepolia
USE_LOCAL_HARDHAT=true

# Sepolia RPC URL (only needed if USE_LOCAL_HARDHAT=false)
# Get from: https://www.alchemy.com/ or https://infura.io/
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY_HERE

# ============================================
# BLOCKCHAIN CREDENTIALS
# ============================================

# Server Wallet Private Key
# Local Hardhat: Use default account #0 (below) or your own
# Sepolia: Use your wallet with testnet ETH
SERVER_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deployed Factory Contract Address
# Update this after deploying to your chosen network
# Local: typically 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Sepolia: your deployed address
NEXT_PUBLIC_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# ============================================
# DATABASE
# ============================================

MONGODB_URI=mongodb://localhost:27017/escrow-platform

# ============================================
# QUICK REFERENCE
# ============================================
# 
# LOCAL DEVELOPMENT:
# 1. Set USE_LOCAL_HARDHAT=true
# 2. Run: npx hardhat node
# 3. Deploy: npx hardhat run scripts/deploy.js --network localhost
# 4. Update NEXT_PUBLIC_FACTORY_ADDRESS
# 
# SEPOLIA TESTNET:
# 1. Set USE_LOCAL_HARDHAT=false
# 2. Add your SEPOLIA_RPC_URL
# 3. Add wallet with Sepolia ETH to SERVER_WALLET_PRIVATE_KEY
# 4. Deploy: npx hardhat run scripts/deploy.js --network sepolia
# 5. Update NEXT_PUBLIC_FACTORY_ADDRESS


//for global hardhat
SERVER_WALLET_PRIVATE_KEY=0x83e20e8891ac373e9702202683cea162235955684d0932da970d6c4db96f7c6d