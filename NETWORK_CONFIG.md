# Environment Configuration Guide

## Network Selection

You can easily switch between local Hardhat and Sepolia testnet by setting environment variables.

### Option 1: Local Hardhat Network (Development)

```env
# .env
USE_LOCAL_HARDHAT=true

# Optional: Use default Hardhat account or specify your own
SERVER_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Your deployed factory address on local network
NEXT_PUBLIC_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Steps:**
1. Start Hardhat node: `npx hardhat node`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
3. Update `NEXT_PUBLIC_FACTORY_ADDRESS` with deployed address
4. Start Next.js: `npm run dev`

**Benefits:**
- ✅ Free (no gas costs)
- ✅ Fast transactions
- ✅ Unlimited test ETH
- ✅ Full control
- ✅ Instant resets

---

### Option 2: Sepolia Testnet (Production-like)

```env
# .env
USE_LOCAL_HARDHAT=false
# or simply remove the USE_LOCAL_HARDHAT line

# Required: Your Alchemy/Infura Sepolia RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Required: Wallet with Sepolia ETH
SERVER_WALLET_PRIVATE_KEY=0xyour_private_key_here

# Your deployed factory address on Sepolia
NEXT_PUBLIC_FACTORY_ADDRESS=0x57c8BF889473FEba1E09449b1A497066347587be
```

**Steps:**
1. Get Sepolia RPC URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
2. Get Sepolia ETH from [faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
3. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
4. Update `NEXT_PUBLIC_FACTORY_ADDRESS`
5. Start Next.js: `npm run dev`

**Benefits:**
- ✅ Public testnet (sharable)
- ✅ Persistent data
- ✅ Real network behavior
- ✅ Blockchain explorer support

---

## Quick Switch Commands

### Switch to Local:
```bash
# In .env, add or change:
USE_LOCAL_HARDHAT=true
NEXT_PUBLIC_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Restart dev server
```

### Switch to Sepolia:
```bash
# In .env, change:
USE_LOCAL_HARDHAT=false
NEXT_PUBLIC_FACTORY_ADDRESS=0x57c8BF889473FEba1E09449b1A497066347587be

# Restart dev server
```

---

## Troubleshooting

### Local Hardhat Issues:
- **Can't connect**: Make sure `npx hardhat node` is running
- **Wrong address**: Redeploy contracts after restarting Hardhat node
- **Nonce errors**: Restart Hardhat node to reset blockchain state

### Sepolia Issues:
- **Insufficient funds**: Get more ETH from faucet
- **Connection timeout**: Check your RPC URL and API key
- **Transaction pending**: Wait longer, Sepolia can be slow

---

## Current Network Detection

When you start the server, you'll see:
```
🔗 Server wallet configured for: Sepolia (Chain ID: 11155111)
📡 RPC URL: https://eth-sepolia.g.alchemy.com/v2/...
💼 Wallet Address: 0xA1F0D22ba7e6D817Ebe2a5E16dAc997E27cC80cc
```

or

```
🔗 Server wallet configured for: Hardhat (Chain ID: 31337)
📡 RPC URL: http://127.0.0.1:8545
💼 Wallet Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```
