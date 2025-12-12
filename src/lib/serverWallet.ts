import { createWalletClient, http, publicActions, parseEther, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

// Hardcoded "Platform" Private Key (Hardhat Account #0)
// IN PRODUCTION: USE ENVIRONMENT VARIABLES
const PRIVATE_KEY = (process.env.SERVER_WALLET_PRIVATE_KEY as `0x${string}`) || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const account = privateKeyToAccount(PRIVATE_KEY);

export const serverWallet = createWalletClient({
  account,
  chain: hardhat,
  transport: http()
}).extend(publicActions);

const publicClient = createPublicClient({
    chain: hardhat,
    transport: http()
});

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_seller", "type": "address" },
      { "internalType": "address", "name": "_arbiter", "type": "address" }
    ],
    "name": "createEscrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const ESCROW_ABI = [
  {
    "inputs": [],
    "name": "approveDelivery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function createCustodialEscrow(sellerAddress: string, amount: string) {
  // The Platform acts as the "Buyer" on-chain, effectively holding the funds for the user.
  // The Platform also acts as the "Arbiter" for simplicity in this custodial mode.
  const hash = await serverWallet.writeContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'createEscrow',
    args: [sellerAddress as `0x${string}`, account.address],
    value: parseEther(amount)
  });
  
  // Wait for receipt to get the address
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // Parse logs to find EscrowCreated event
  let escrowAddress = null;
  for (const log of receipt.logs) {
      if (log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()) {
         // topic[1] is the escrow address.
         if (log.topics[1]) {
             escrowAddress = `0x${log.topics[1].slice(26)}`; // Remove padding
         }
      }
  }

  return { hash, escrowAddress };
}

export async function approveCustodialEscrow(escrowAddress: string) {
  const hash = await serverWallet.writeContract({
    address: escrowAddress as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'approveDelivery'
  });
  return hash;
}
