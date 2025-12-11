"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        brandName: '',
        website: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'SELLER', ...formData })
            });

            const data = await res.json();
            if (data.success) {
                // Store user in localStorage for session
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/seller/dashboard');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Seller Registration
                </h1>
                <p className="text-slate-400 mb-8">Create your seller account to start listing products</p>

                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Email *</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Phone Number *</label>
                        <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="+234 800 000 0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Password *</label>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Brand Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.brandName}
                            onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="My Business"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Website (Optional)</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                            placeholder="https://mybusiness.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-bold transition"
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
