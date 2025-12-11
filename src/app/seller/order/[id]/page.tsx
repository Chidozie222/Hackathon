"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket, joinOrderRoom, leaveOrderRoom } from '@/lib/socket';

export default function OrderSuccess() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        const fetchOrder = () => {
            fetch(`/api/orders/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrder(data.order);
                    }
                });
        };

        // Initial fetch
        fetchOrder();

        // Set up Socket.io real-time updates
        if (isConnected && socket) {
            joinOrderRoom(params.id as string);

            socket.on('order-updated', (updatedOrder: any) => {
                console.log('📡 Seller: Real-time order update');
                setOrder(updatedOrder);
            });

            // Listen for rider location updates
            socket.on('rider-location-update', (data: any) => {
                console.log('📍 Rider location update:', data);
                // You can use this for real-time map updates
            });

            return () => {
                socket.off('order-updated');
                socket.off('rider-location-update');
                leaveOrderRoom(params.id as string);
            };
        } else {
            const interval = setInterval(fetchOrder, 5000);
            return () => clearInterval(interval);
        }
    }, [params.id, socket, isConnected]);

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

                {/* Real-time Order Status */}
                <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">📍 Order Status & Tracking</h2>
                    
                    {/* Status Timeline */}
                    <div className="space-y-3 mb-6">
                        <div className={`flex items-center gap-3 p-3 rounded ${order.status !== 'PENDING_PAYMENT' ? 'bg-emerald-900/20 border border-emerald-600' : 'bg-slate-900'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status !== 'PENDING_PAYMENT' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                {order.status !== 'PENDING_PAYMENT' ? '✓' : '💳'}
                            </div>
                            <div>
                                <p className="font-bold">Payment</p>
                                <p className="text-sm text-slate-400">
                                    {order.status !== 'PENDING_PAYMENT' ? 'Paid ✓' : 'Waiting for buyer payment'}
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-3 rounded ${order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' ? 'bg-purple-900/20 border border-purple-600' : 'bg-slate-900'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                                {order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' ? '✓' : '🚚'}
                            </div>
                            <div>
                                <p className="font-bold">In Transit</p>
                                <p className="text-sm text-slate-400">
                                    {order.status === 'IN_TRANSIT' ? '🔄 Rider is delivering...' : 
                                     order.status === 'DELIVERED' ? 'Delivered ✓' : 'Waiting for pickup'}
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-3 rounded ${order.status === 'DELIVERED' ? 'bg-emerald-900/20 border border-emerald-600' : 'bg-slate-900'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'DELIVERED' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                {order.status === 'DELIVERED' ? '🎉' : '📦'}
                            </div>
                            <div>
                                <p className="font-bold">Delivered</p>
                                <p className="text-sm text-slate-400">
                                    {order.status === 'DELIVERED' ? 'Completed! Buyer confirmed delivery' : 'Not yet delivered'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rider Location */}
                    {(order.status === 'IN_TRANSIT' || order.status === 'PAID') && (
                        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                            <h3 className="font-bold mb-2">🚗 Rider Location (Demo)</h3>
                            <p className="text-sm text-slate-300 mb-3">
                                {order.status === 'IN_TRANSIT' ? 
                                    'Rider is en route to delivery address...' : 
                                    'Waiting for rider to start delivery'}
                            </p>
                            {/* Mock map - replace with Google Maps API */}
                            <div className="bg-slate-900 rounded p-4 text-center text-sm text-slate-500">
                                <p>📍 Mock Location: En route</p>
                                <p className="text-xs mt-2">
                                    For production: Integrate Google Maps API with real-time rider location tracking
                                </p>
                                <button 
                                    onClick={() => window.open(`https://www.google.com/maps/search/${order.deliveryAddress}`, '_blank')}
                                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition"
                                >
                                    🗺️ View Delivery Location
                                </button>
                            </div>
                        </div>
                    )}
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
