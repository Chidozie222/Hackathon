---
description: Start the project locally (Blockchain + Frontend)
---

To run the project locally, you need three separate terminal instances.

1. **Start the local Hardhat Node**
   This simulates the Ethereum blockchain locally.
   ```powershell
   npx hardhat node
   ```

2. **Deploy Smart Contracts**
   Deploy the contracts to your local node.
   *Note: Do this in a NEW terminal.*
   // turbo
   ```powershell
   npx hardhat run scripts/deploy.js --network localhost
   ```
   > Copy the deployed `EscrowFactory` address if needed, though the frontend might expect it in a config file or you may need to update it in `src/components/EscrowCreate.tsx`.

3. **Start the Next.js Frontend**
   *Note: Do this in a NEW terminal.*
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
