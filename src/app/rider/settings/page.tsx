"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RiderSettings() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/signin');
            return;
        }
        setUser(JSON.parse(userStr));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/signin');
    };

    if (!user) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-md mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/rider/dashboard')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-slate-400">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded border border-purple-700">
                                Rider Account
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">User ID</label>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-sm text-slate-300">
                                {user.id || user._id}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </div>
    );
}
