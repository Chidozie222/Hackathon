"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderSuccess() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/orders/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrder(data.order);
                }
            });
    }, [params.id]);

    if (!order) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

    console.log('Order data:', order); // Debug log
    console.log('Rider type:', order.riderType);
    console.log('Rider access token:', order.riderAccessToken);

    const buyerLink = `${window.location.origin}/order/${order.id}`;
    const riderLink = order.riderAccessToken ? `${window.location.origin}/rider/temp/${order.riderAccessToken}` : null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.push('/seller/dashboard')} className="text-slate-400 hover:text-white mb-4">
                    ← Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Order Created Successfully! 🎉
                </h1>
                <p className="text-slate-400 mb-8">Share the buyer link and prepare the QR code for pickup</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">QR Code for Delivery</h2>
                        <p className="text-sm text-slate-400 mb-4">Print and attach this to the product. The rider will scan it at pickup, and the buyer will scan it at delivery.</p>
                        <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                            <img src={order.qrCode} alt="Order QR Code" className="max-w-full" />
                        </div>
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = order.qrCode;
                                link.download = `order-${order.id}-qr.png`;
                                link.click();
                            }}
                            className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                        >
                            Download QR Code
                        </button>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">Buyer Link</h2>
                            <p className="text-sm text-slate-400 mb-3">Share this link with the buyer to view order and make payment:</p>
                            <div className="bg-slate-900 p-3 rounded border border-slate-600 break-all text-sm mb-3">
                                {buyerLink}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(buyerLink);
                                    alert('Link copied to clipboard!');
                                }}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold"
                            >
                                Copy Buyer Link
                            </button>
                        </div>

                        {/* Rider Section - Always visible */}
                        <div className={`p-6 rounded-xl ${order.riderType === 'PERSONAL' ? 'bg-slate-800 border border-purple-500' : 'bg-slate-800 border border-slate-700'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${order.riderType === 'PERSONAL' ? 'text-purple-400' : 'text-slate-400'}`}>
                                {order.riderType === 'PERSONAL' ? '🏍️ Personal Rider Link' : '🚚 Platform Rider'}
                            </h2>
                            
                            {order.riderType === 'PERSONAL' ? (
                                <>
                                    <p className="text-sm text-slate-400 mb-3">✅ Personal rider selected. Share this link:</p>
                                    {riderLink ? (
                                        <>
                                            <div className="bg-slate-900 p-3 rounded border border-purple-600 break-all text-sm mb-3">
                                                {riderLink}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(riderLink);
                                                    alert('Rider link copied to clipboard!');
                                                }}
                                                className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold transition"
                                            >
                                                📋 Copy Personal Rider Link
                                            </button>
                                        </>
                                    ) : (
                                        <div className="bg-red-900/30 border border-red-500 rounded p-3 text-sm text-red-400">
                                            ⚠️ Error: Rider link not generated. Please contact support.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-400 mb-2">✅ Platform rider will be assigned automatically</p>
                                    <p className="text-xs text-slate-500">A rider from our platform will pick up this order once the buyer makes payment.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-400">Item:</span>
                            <p className="font-bold">{order.itemName}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Price:</span>
                            <p className="font-bold">₦{order.price}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Pickup:</span>
                            <p>{order.pickupAddress}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Delivery:</span>
                            <p>{order.deliveryAddress}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Status:</span>
                            <p className="text-orange-400 font-bold">{order.status}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Rider:</span>
                            <p className="font-bold">{order.riderType === 'PERSONAL' ? 'Personal Rider' : 'Platform Rider'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
