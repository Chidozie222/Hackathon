"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

export default function CreateOrder() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        itemName: '',
        price: '',
        buyerPhone: '',
        pickupAddress: '',
        deliveryAddress: '',
        agreementSummary: '',
        riderType: 'PLATFORM' as 'PLATFORM' | 'PERSONAL',
        riderId: ''
    });
    const [photo, setPhoto] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/seller/register');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {'image/*': []},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        setPhoto(data.url);
                    }
                } catch (error) {
                    console.error(error);
                    alert('Upload failed');
                } finally {
                    setUploading(false);
                }
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: user.id,
                    ...formData,
                    productPhoto: photo
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Order created successfully! Share the buyer link.');
                router.push(`/seller/order/${data.order.id}`);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create order');
        } finally {
            setIsCreating(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white mb-4">
                    ← Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Create New Order
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                        <h2 className="text-xl font-bold">Product Details</h2>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Item Name *</label>
                            <input
                                required
                                type="text"
                                value={formData.itemName}
                                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                                placeholder="e.g., iPhone 13 Pro"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Price (NGN) *</label>
                            <input
                                required
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                                placeholder="50000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Product Photo</label>
                            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${photo ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                                <input {...getInputProps()} />
                                {uploading ? (
                                    <p>Uploading...</p>
                                ) : photo ? (
                                    <div>
                                        <img src={photo} alt="Product" className="max-h-48 mx-auto mb-2 rounded" />
                                        <p className="text-emerald-400">Photo uploaded ✓</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-400">Drag & drop photo here, or click to select</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Agreement Summary *</label>
                            <textarea
                                required
                                value={formData.agreementSummary}
                                onChange={(e) => setFormData({...formData, agreementSummary: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none h-24"
                                placeholder="Describe what you and the buyer agreed upon..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                        <h2 className="text-xl font-bold">Delivery Information</h2>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Buyer Phone Number *</label>
                            <input
                                required
                                type="tel"
                                value={formData.buyerPhone}
                                onChange={(e) => setFormData({...formData, buyerPhone: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Pickup Address *</label>
                            <input
                                required
                                type="text"
                                value={formData.pickupAddress}
                                onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                                placeholder="Full pickup address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Delivery Address *</label>
                            <input
                                required
                                type="text"
                                value={formData.deliveryAddress}
                                onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-emerald-500 outline-none"
                                placeholder="Full delivery address"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                        <h2 className="text-xl font-bold">Rider Selection</h2>
                        
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded border border-slate-600 cursor-pointer">
                                <input
                                    type="radio"
                                    name="riderType"
                                    value="PLATFORM"
                                    checked={formData.riderType === 'PLATFORM'}
                                    onChange={(e) => setFormData({...formData, riderType: 'PLATFORM'})}
                                />
                                <span>Use Platform Rider (We'll assign one)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded border border-slate-600 cursor-pointer">
                                <input
                                    type="radio"
                                    name="riderType"
                                    value="PERSONAL"
                                    checked={formData.riderType === 'PERSONAL'}
                                    onChange={(e) => setFormData({...formData, riderType: 'PERSONAL'})}
                                />
                                <span>Use Personal Rider (You'll share a link with them)</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-bold transition"
                    >
                        {isCreating ? 'Creating Order...' : 'Create Order & Generate QR Code'}
                    </button>
                </form>
            </div>
        </div>
    );
}
