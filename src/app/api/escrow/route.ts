import { NextRequest, NextResponse } from 'next/server';
import { createCustodialEscrow, approveCustodialEscrow } from '../../../lib/serverWallet';
import { addManagedEscrow, getManagedEscrows, updateManagedEscrow } from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { amount, sellerEmail } = await req.json();
    
    // 1. Create On-Chain Escrow via Server Wallet
    const { hash: txHash, escrowAddress } = await createCustodialEscrow(sellerEmail, amount);
    
    const newEscrow = {
      id: uuidv4(),
      buyerEmail: 'current_user@demo.com', // Mock logged-in user
      sellerEmail,
      amount,
      status: 'PENDING' as const,
      txHash,
      escrowAddress: escrowAddress || undefined,
      createdAt: Date.now()
    };

    addManagedEscrow(newEscrow);
    
    return NextResponse.json({ success: true, escrow: newEscrow });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, escrowAddress } = await req.json();
        
        // In a real app, we'd lookup the escrow address from DB or chain.
        // For this hackathon, we assume the client might pass the address if known, 
        // OR we need to find it from the Factory events.
        // simplified: The server wallet is the arbiter. We just need the escrow contract address.
        // If we don't have it stored (because we didn't wait for receipt), we can't approve yet.
        
        // FIX: In `createCustodialEscrow`, we simply return the hash. 
        // We'll need the user to "Refresh" or we need a background worker to check for the address.
        // For simplicity: The client connects to the chain and sees the events?
        // OR: Use the server wallet to find the last created escrow?
        
        // Let's rely on the Client passing the address if they see it, OR 
        // we'll update the server wallet to wait for receipt.
        
        if (!escrowAddress) {
             return NextResponse.json({ success: false, error: "Escrow address required" }, { status: 400 });
        }

        const txHash = await approveCustodialEscrow(escrowAddress);
        updateManagedEscrow(id, { status: 'APPROVED' });
        
        return NextResponse.json({ success: true, txHash });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ escrows: getManagedEscrows() });
}
