import { createWalletClient, http, publicActions, parseEther, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat, sepolia } from 'viem/chains';

// Determine which network to use
const USE_SEPOLIA = process.env.SEPOLIA_RPC_URL ? true : false;
const selectedChain = USE_SEPOLIA ? sepolia : hardhat;
const rpcUrl = USE_SEPOLIA ? process.env.SEPOLIA_RPC_URL : 'http://127.0.0.1:8545';

// Platform Private Key
const PRIVATE_KEY = (process.env.SERVER_WALLET_PRIVATE_KEY as `0x${string}`) || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const account = privateKeyToAccount(PRIVATE_KEY);

console.log(`🔗 Server wallet using network: ${selectedChain.name} (${selectedChain.id})`);

export const serverWallet = createWalletClient({
  account,
  chain: selectedChain,
  transport: http(rpcUrl)
}).extend(publicActions);

const publicClient = createPublicClient({
    chain: selectedChain,
    transport: http(rpcUrl)
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
    "name": "confirmDelivery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_reason", "type": "string" }
    ],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDisputed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disputeReason",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disputeTimestamp",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function createCustodialEscrow(sellerAddress: string, amount: string) {
  // The Platform acts as the "Buyer" on-chain, effectively holding the funds for the user.
  // The Platform also acts as the "Arbiter" for simplicity in this custodial mode.
  
  try {
    // Get the latest nonce to prevent nonce conflicts
    const nonce = await publicClient.getTransactionCount({
      address: account.address,
      blockTag: 'pending'
    });
    
    const hash = await serverWallet.writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createEscrow',
      args: [sellerAddress as `0x${string}`, account.address],
      value: parseEther(amount),
      nonce
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
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || '';
    
    // If transaction is already known, it means a previous attempt is still pending
    if (errorMsg.includes('already known')) {
      console.log('⚠️ Transaction already in mempool. Waiting for it to complete...');
      
      // Get pending nonce to find which transaction to wait for
      const pendingNonce = await publicClient.getTransactionCount({
        address: account.address,
        blockTag: 'pending'
      });
      
      const currentNonce = await publicClient.getTransactionCount({
        address: account.address,
        blockTag: 'latest'
      });
      
      // If there's a pending transaction, wait for it
      if (pendingNonce > currentNonce) {
        console.log(`⏳ Waiting for pending transaction (nonce ${currentNonce}) to complete...`);
        
        // Wait up to 30 seconds for pending transaction
        for (let i = 0; i < 15; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newNonce = await publicClient.getTransactionCount({
            address: account.address,
            blockTag: 'latest'
          });
          
          if (newNonce > currentNonce) {
            console.log('✅ Pending transaction completed!');
            // The transaction completed, but we don't have the escrow address
            // This is acceptable since the idempotency check will catch it
            return { hash: '0x', escrowAddress: null };
          }
        }
        
        console.log('⚠️ Timeout waiting for pending transaction');
      }
      
      // If we get here, just return empty - idempotency check will handle it
      return { hash: '0x', escrowAddress: null };
    }
    
    // For nonce too low, the transaction was already processed
    if (errorMsg.includes('nonce too low')) {
      console.log('ℹ️ Transaction already processed (nonce too low)');
      return { hash: '0x', escrowAddress: null };
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function approveCustodialEscrow(escrowAddress: string) {
  const nonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: 'pending'
  });
  
  const hash = await serverWallet.writeContract({
    address: escrowAddress as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'confirmDelivery',
    nonce
  });
  return hash;
}

export async function raiseDisputeOnChain(escrowAddress: string, reason: string) {
  // Platform wallet submits the dispute on behalf of the buyer
  const nonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: 'pending'
  });
  
  const hash = await serverWallet.writeContract({
    address: escrowAddress as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'raiseDispute',
    args: [reason],
    nonce
  });
  
  // Wait for transaction to be mined
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
}

