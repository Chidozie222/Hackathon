"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RiderRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: '',
        licensePlate: '',
        nin: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'RIDER', ...formData })
            });

            const data = await res.json();
            if (data.success) {
                // Store user in localStorage for session
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Registration successful! You can now be assigned deliveries by sellers.');
                router.push('/');
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
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        🏍️ Rider Registration
                    </h1>
                    <p className="text-slate-400">Join our delivery network and start earning</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
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
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
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
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                            placeholder="+234 800 000 0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Vehicle Type *</label>
                        <select
                            required
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                        >
                            <option value="">Select vehicle type</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="Car">Car</option>
                            <option value="Van">Van</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">License Plate Number *</label>
                        <input
                            required
                            type="text"
                            value={formData.licensePlate}
                            onChange={(e) => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none uppercase"
                            placeholder="ABC-123-XY"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">NIN/BVN *</label>
                        <input
                            required
                            type="text"
                            value={formData.nin}
                            onChange={(e) => setFormData({...formData, nin: e.target.value})}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                            placeholder="12345678901"
                            maxLength={11}
                        />
                        <p className="text-xs text-slate-500 mt-1">National Identity Number or Bank Verification Number</p>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500 rounded p-4 text-sm">
                        <p className="text-purple-300">
                            ℹ️ <strong>Note:</strong> After registration, sellers can assign deliveries to you by sharing a unique access link for each order.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded font-bold transition"
                    >
                        {isLoading ? 'Creating Account...' : 'Register as Rider'}
                    </button>

                    <div className="text-center text-sm text-slate-400">
                        <p>Registering as a seller? <a href="/seller/register" className="text-emerald-400 hover:underline">Click here</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
