"use client";
import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { analyzeTransactionRisk } from '../utils/aiRisk';

// Minimal ABI for Factory
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

// Address would come from env or constant
const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default deploy

export default function EscrowCreate() {
  const [seller, setSeller] = useState('');
  const [arbiter, setArbiter] = useState('');
  const [amount, setAmount] = useState('');
  const [risk, setRisk] = useState<{score:number, reason:string} | null>(null);

  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleAnalyze = async () => {
    const result = await analyzeTransactionRisk(seller, amount);
    setRisk(result);
  };

  const handleCreate = async () => {
    if (!seller || !arbiter || !amount) return;
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createEscrow',
      args: [seller, arbiter],
      value: parseEther(amount),
    });
  };

  return (
    <div className="p-6 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">Start New Escrow</h2>
      
      <div className="space-y-4">
        <div>
           <label className="block text-sm text-slate-400">Seller Address</label>
           <input className="w-full p-2 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none" 
                  value={seller} onChange={e => setSeller(e.target.value)} placeholder="0x..." />
        </div>
        <div>
           <label className="block text-sm text-slate-400">Arbiter Address</label>
           <input className="w-full p-2 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none" 
                  value={arbiter} onChange={e => setArbiter(e.target.value)} placeholder="0x..." />
        </div>
        <div>
           <label className="block text-sm text-slate-400">Amount (ETH)</label>
           <input className="w-full p-2 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none" 
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="1.0" />
        </div>

        <div className="flex gap-4">
            <button onClick={handleAnalyze} className="px-4 py-2 bg-blue-600 hovered:bg-blue-500 rounded font-semibold transition">
                Analyze Risk (AI)
            </button>
            <button disabled={!risk || isConfirming} onClick={handleCreate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-semibold transition">
                {isConfirming ? 'Creating...' : 'Deposit & Create'}
            </button>
        </div>

        {risk && (
            <div className={`p-3 rounded border ${risk.score > 50 ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                <p className="font-bold">Risk Score: {risk.score}/100</p>
                <p className="text-sm">{risk.reason}</p>
            </div>
        )}

        {hash && <div className="text-xs text-slate-400 break-all">Tx Hash: {hash}</div>}
        {isConfirmed && <div className="text-green-400 font-bold">Escrow Created Successfully!</div>}
        {error && <div className="text-red-400 text-sm">{error.message}</div>}
      </div>
    </div>
  );
}
