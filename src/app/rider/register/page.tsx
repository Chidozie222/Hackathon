"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RiderRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: '',
        licensePlate: '',
        nin: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    const handleVerify = async () => {
        if (!formData.nin || !formData.name) {
            setVerificationError('Please enter your name and NIN/BVN first');
            return;
        }

        setIsVerifying(true);
        setVerificationError('');

        try {
            const res = await fetch('/api/verify/identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ninOrBvn: formData.nin,
                    name: formData.name,
                    type: 'RIDER'
                })
            });

            const data = await res.json();
            if (data.success && data.verified) {
                setIsVerified(true);
                setVerificationError('');
            } else {
                setVerificationError(data.error || 'Verification failed');
                setIsVerified(false);
            }
        } catch (error) {
            console.error(error);
            setVerificationError('Network error. Please try again.');
            setIsVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isVerified) {
            alert('Please verify your NIN/BVN before submitting');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'RIDER', 
                    ...formData,
                    identityVerified: true,
                    verifiedAt: Date.now()
                })
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
                        <label className="block text-sm text-slate-400 mb-2">Password *</label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full p-3 pr-12 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                                placeholder="••••••••"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Vehicle Type *</label>
                        <select
                            required
                            value={formData.vehicleType}
                            onChange={(e) => {
                                setFormData({...formData, vehicleType: e.target.value, licensePlate: e.target.value === 'Bicycle' ? '' : formData.licensePlate});
                            }}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                        >
                            <option value="">Select vehicle type</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="Car">Car</option>
                            <option value="Van">Van</option>
                        </select>
                    </div>

                    {formData.vehicleType && formData.vehicleType !== 'Bicycle' && (
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
                    )}

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">NIN/BVN *</label>
                        <div className="flex gap-2">
                            <input
                                required
                                type="text"
                                value={formData.nin}
                                onChange={(e) => {
                                    setFormData({...formData, nin: e.target.value});
                                    setIsVerified(false);
                                    setVerificationError('');
                                }}
                                className="flex-1 p-3 rounded bg-slate-900 border border-slate-600 focus:border-purple-500 outline-none"
                                placeholder="12345678901"
                                maxLength={11}
                                disabled={isVerified}
                            />
                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={isVerifying || isVerified || !formData.nin || !formData.name}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded font-bold transition whitespace-nowrap"
                            >
                                {isVerifying ? 'Verifying...' : isVerified ? '✓ Verified' : 'Verify'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">National Identity Number or Bank Verification Number</p>
                        
                        {isVerified && (
                            <div className="mt-2 p-3 bg-green-900/30 border border-green-500 rounded text-sm text-green-300">
                                ✓ Identity verified successfully
                            </div>
                        )}
                        
                        {verificationError && (
                            <div className="mt-2 p-3 bg-red-900/30 border border-red-500 rounded text-sm text-red-300">
                                ⚠️ {verificationError}
                            </div>
                        )}
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

                    <div className="text-center text-sm text-slate-400 space-y-2">
                        <p>Already have an account? <a href="/signin" className="text-blue-400 hover:underline">Sign In</a></p>
                        <p>Registering as a seller? <a href="/seller/register" className="text-emerald-400 hover:underline">Click here</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
