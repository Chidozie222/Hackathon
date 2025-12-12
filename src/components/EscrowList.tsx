"use client";
import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import EscrowDetail from './EscrowDetail';

const FACTORY_ABI = [
  {
    "inputs": [],
    "name": "getAllEscrows",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "escrowAddress", "type": "address" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "address", "name": "arbiter", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "internalType": "struct EscrowFactory.EscrowInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function EscrowList() {
  const { data: escrows, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getAllEscrows',
  });

  return (
    <div className="p-6 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Active Escrows</h2>
        <button onClick={() => refetch()} className="text-sm text-slate-400 hover:text-white">Refresh</button>
      </div>
      
      <div className="grid gap-4">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">My Managed Payments</h3>
        <ManagedEscrowList />
      </div>
    </div>
  );
}

function ManagedEscrowList() {
    const [managed, setManaged] = useState<any[]>([]);
    
    const fetchManaged = async () => {
        const res = await fetch('/api/escrow');
        const data = await res.json();
        if (data.escrows) setManaged(data.escrows);
    };

    useEffect(() => {
        fetchManaged();
        const interval = setInterval(fetchManaged, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id: string, escrowAddress: string) => {
        if(!escrowAddress) return alert("Escrow address not ready yet");
        
        try {
            const res = await fetch('/api/escrow', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id, escrowAddress })
            });
            const data = await res.json();
            if(data.success) {
                alert("Approved! Funds released.");
                fetchManaged();
            } else {
                alert("Error: " + data.error);
            }
        } catch(e) { console.error(e); }
    };

    if (managed.length === 0) return <p className="text-slate-500 italic">No managed payments yet.</p>;

    return (
        <div className="space-y-4">
            {managed.map(m => (
                <div key={m.id} className="p-4 bg-slate-900 rounded border border-purple-500/30 flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg text-purple-300">Amount: ₦{m.amount}</p>
                        <p className="text-sm text-slate-400">Seller: {m.sellerEmail}</p>
                        <p className="text-xs text-slate-500">Status: <span className={m.status === 'APPROVED' ? 'text-green-400' : 'text-orange-400'}>{m.status}</span></p>
                        {m.txHash && <p className="text-xs text-slate-600 font-mono">Tx: {m.txHash.slice(0,10)}...</p>}
                    </div>
                    <div>
                        {m.status === 'PENDING' && (
                            <button 
                                onClick={() => handleApprove(m.id, m.escrowAddress)}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm font-bold transition"
                            >
                                Release Funds
                            </button>
                        )}
                        {m.status === 'APPROVED' && <span className="text-green-500 font-bold px-2">✓ Paid</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}
