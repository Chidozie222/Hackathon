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

const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
        {(!escrows || (escrows as any[]).length === 0) ? (
            <p className="text-slate-500 italic">No escrows found.</p>
        ) : (
            (escrows as any[]).map((escrow: any, idx: number) => (
                <EscrowDetail key={escrow.escrowAddress} info={escrow} />
            ))
        )}
      </div>
    </div>
  );
}
