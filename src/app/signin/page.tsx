"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Auto-redirect based on user type
                if (data.user.type === 'SELLER') {
                    router.push('/seller/dashboard');
                } else if (data.user.type === 'RIDER') {
                    router.push('/rider/dashboard');
                } else {
                    router.push('/');
                }
            } else {
                alert(data.error || 'Sign in failed');
            }
        } catch (error) {
            console.error(error);
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                        Sign In
                    </h1>
                    <p className="text-slate-400">Welcome back! Enter your credentials</p>
                </div>

                <form onSubmit={handleSignIn} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Password</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-bold transition"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="text-center text-sm text-slate-400 space-y-2">
                        <p>Don't have an account?</p>
                        <div className="flex gap-2 justify-center">
                            <a href="/seller/register" className="text-emerald-400 hover:underline">
                                Register as Seller
                            </a>
                            <span>•</span>
                            <a href="/rider/register" className="text-purple-400 hover:underline">
                                Register as Rider
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
