"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/seller/register');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                            {user.brandName}
                        </h1>
                        <p className="text-slate-400">Welcome back, {user.name}</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            router.push('/');
                        }}
                        className="text-red-400 hover:text-red-300"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid gap-6">
                    <button
                        onClick={() => router.push('/seller/create-order')}
                        className="p-6 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 rounded-xl font-bold text-xl transition"
                    >
                        + Create New Order
                    </button>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Your Orders</h2>
                        <p className="text-slate-400 text-center py-8">No orders yet. Create your first order to get started!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
