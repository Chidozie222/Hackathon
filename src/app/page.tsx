"use client";
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { config } from '../config';
import EscrowCreate from '../components/EscrowCreate';
import EscrowList from '../components/EscrowList';

function App() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            EtherScrow AI
        </h1>
        <div className="flex gap-2">
            {isConnected ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                    <button onClick={() => disconnect()} className="text-sm text-red-400 hover:text-red-300">Disconnect</button>
                </div>
            ) : (
                connectors.map((connector) => (
                    <button 
                        key={connector.uid} 
                        onClick={() => {
                            console.log("Attempting to connect with", connector.name);
                            connect({ connector }, {
                                onError: (err) => {
                                    console.error("Connection failed", err);
                                    alert("Connection Failed: " + err.message);
                                }
                            });
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-900 rounded font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                        Connect {connector.name}
                    </button>
                ))
            )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {!isConnected ? (
            <div className="text-center py-20">
                <p className="text-xl text-slate-400">Please connect your wallet to start.</p>
            </div>
        ) : (
            <>
                <EscrowCreate />
                <EscrowList />
            </>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return <App />;
}
