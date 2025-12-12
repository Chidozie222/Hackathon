"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SellerSidebar from '@/components/layout/SellerSidebar';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        brandName: '',
        website: '',
        walletAddress: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/signin');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Initialize form
        setFormData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            brandName: parsedUser.brandName || '',
            website: parsedUser.website || '',
            walletAddress: parsedUser.walletAddress || ''
        });
        
        setLoading(false);
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Update local storage
                localStorage.setItem('user', JSON.stringify(result.user));
                setUser(result.user);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Settings...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <SellerSidebar />
            
            <main className="md:ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-slate-400 mb-8">Manage your account profile and preferences</p>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
                            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                                <p className="text-slate-400">{user?.role} Account</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 ${
                                message.type === 'success' 
                                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-red-900/30 text-red-400 border border-red-500/30'
                            }`}>
                                {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Brand / Store Name</label>
                                    <input
                                        type="text"
                                        name="brandName"
                                        value={formData.brandName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Website URL</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
                                    placeholder="https://"
                                />
                            </div>



                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <span className="animate-spin">⏳</span> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span>💾</span> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
