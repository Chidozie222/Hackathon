---
description: Deploy Smart Contracts to Sepolia Testnet
---

# Deploy to Sepolia

This workflow guides you through deploying your Escrow Smart Concepts to the Sepolia public testnet.

## Prerequisites
1. **Sepolia RPC URL**: Get one for free from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/).
2. **Testnet ETH**: Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/).
3. **Private Key**: Export your wallet private key (that holds the Testnet ETH) from Metamask.

## Setup
1. Open `.env` file.
2. Add your RPC URL: `SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
3. Update `SERVER_WALLET_PRIVATE_KEY` with your exported private key (ensure it starts with `0x`).

## Deployment Command
Run the following command to deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Post-Deployment
The terminal will output the new **Factory Address**.
1. Copy this address.
2. Update `.env`: `NEXT_PUBLIC_FACTORY_ADDRESS=0xYourNewAddress...`
3. Restart your application: `npm run dev` or redeploy your frontend.
