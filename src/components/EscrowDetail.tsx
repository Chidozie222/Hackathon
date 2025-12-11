"use client";
import React from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { formatEther } from 'viem';

const ESCROW_ABI = [
  {
    "inputs": [],
    "name": "confirmDelivery",
    "outputs": [],
    "stateMutability": "external",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refund",
    "outputs": [],
    "stateMutability": "external",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDeliveryConfirmed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isRefunded",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function EscrowDetail({ info }: { info: any }) {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: isConfirmed } = useReadContract({
    address: info.escrowAddress,
    abi: ESCROW_ABI,
    functionName: 'isDeliveryConfirmed',
  });

  const { data: isRefunded } = useReadContract({
    address: info.escrowAddress,
    abi: ESCROW_ABI,
    functionName: 'isRefunded',
  });

  const handleConfirm = () => {
    writeContract({
      address: info.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'confirmDelivery',
    });
  };

  const handleRefund = () => {
    writeContract({
      address: info.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'refund',
    });
  };

  const status = isConfirmed ? "Completed" : isRefunded ? "Refunded" : "Active";
  const statusColor = isConfirmed ? "text-green-400" : isRefunded ? "text-red-400" : "text-yellow-400";

  return (
    <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-mono text-sm text-slate-300">{info.escrowAddress}</h3>
        <span className={`font-bold ${statusColor}`}>{status}</span>
      </div>
      
      <div className="text-sm text-slate-400 grid grid-cols-2 gap-2 mb-4">
        <div>Buyer: <span className="text-slate-200">{info.buyer.slice(0,6)}...</span></div>
        <div>Seller: <span className="text-slate-200">{info.seller.slice(0,6)}...</span></div>
        <div>Arbiter: <span className="text-slate-200">{info.arbiter.slice(0,6)}...</span></div>
        <div>Amount: <span className="text-emerald-400 font-bold">{formatEther(info.amount)} ETH</span></div>
      </div>

      <div className="flex gap-2 mt-2">
        {status === "Active" && address === info.buyer && (
            <button onClick={handleConfirm} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-500 py-1 px-3 rounded text-sm font-semibold">
                {isLoading ? 'Processing...' : 'Confirm Delivery'}
            </button>
        )}
        {status === "Active" && (address === info.seller || address === info.arbiter) && (
            <button onClick={handleRefund} disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-500 py-1 px-3 rounded text-sm font-semibold">
                {isLoading ? 'Processing...' : 'Refund Buyer'}
            </button>
        )}
      </div>
      {hash && <p className="text-xs text-slate-500 mt-2 break-all">Tx: {hash}</p>}
    </div>
  );
}
