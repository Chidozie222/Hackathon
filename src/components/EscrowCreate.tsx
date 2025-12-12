"use client";
import React, { useState, useEffect } from 'react';
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
// Address would come from env or constant
const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default deploy

export default function EscrowCreate() {
  // Hardcode mode to STANDARD for simplified view
  const mode = 'STANDARD';
  
  const [email, setEmail] = useState('');
  
  // Unused state for now, but keeping if we ever revert or for type safety in other places if needed (though we can remove)
  // const [seller, setSeller] = useState(''); 
  // const [arbiter, setArbiter] = useState('');
  
  const [amount, setAmount] = useState('');
  const [risk, setRisk] = useState<{score:number, reason:string} | null>(null);

  // useWriteContract hooks removed/ignored for this view as we are API only
  const { data: hash } = useWriteContract(); 
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Create via API
  const [isCreating, setIsCreating] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);

  const handleAnalyze = async () => {
    const result = await analyzeTransactionRisk(email, amount);
    setRisk(result);
  };

  const handleCreate = async () => {
        // Standard Mode Only
        if (!email || !amount) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, sellerEmail: email })
            });
            const data = await res.json();
            if (data.success && data.authorization_url) {
                // Redirect to Paystack
                window.location.href = data.authorization_url;
            } else {
                alert('Error: ' + (data.error || 'Failed to initialize payment'));
                setIsCreating(false);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to init payment');
            setIsCreating(false);
        }
  };
  
  // Check for successful payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
        const id = params.get('escrowId');
        setApiResult({ id, status: 'APPROVED (Payment Verified)' });
    }
  }, []);

  return (
    <div className="p-6 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">New Secure Payment</h2>
      
      <div className="space-y-4">
        <div>
            <label className="block text-sm text-slate-400">Seller Email</label>
            <input className="w-full p-2 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none" 
                    value={email} onChange={e => setEmail(e.target.value)} placeholder="seller@example.com" />
        </div>

        <div>
           <label className="block text-sm text-slate-400">Amount (NGN)</label>
           <input className="w-full p-2 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none" 
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" />
        </div>

        <div className="flex gap-4">
            <button onClick={handleAnalyze} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition">
                Analyze Risk (AI)
            </button>
            <button 
                disabled={!risk || isCreating} 
                onClick={handleCreate} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-semibold transition"
            >
                {isCreating ? 'Processing...' : 'Pay with Card'}
            </button>
        </div>

        {risk && (
            <div className={`p-3 rounded border ${risk.score > 50 ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                <p className="font-bold">Risk Score: {risk.score}/100</p>
                <p className="text-sm">{risk.reason}</p>
            </div>
        )}

        {apiResult && (
            <div className="p-4 bg-green-900/30 border border-green-500 rounded">
                <p className="font-bold text-green-400">Payment Successful & Escrow Created!</p>
                <p className="text-sm text-slate-300">ID: {apiResult.id}</p>
                <p className="text-sm text-slate-300">Status: {apiResult.status}</p>
            </div>
        )}
      </div>
    </div>
  );
}
