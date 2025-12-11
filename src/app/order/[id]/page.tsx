"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OrderView() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
   const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetch(`/api/orders/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrder(data.order);
                    // Auto-redirect to tracking if already paid
                    if (data.order.status !== 'PENDING_PAYMENT') {
                        router.push(`/order/${params.id}/track`);
                    }
                }
                setLoading(false);
            });
    }, [params.id, router]);

    const handlePay = async () => {
        setPaying(true);
        try {
            const res = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: order.price,
                    sellerEmail: order.id, // Using order ID as reference
                    orderId: order.id
                })
            });
            const data = await res.json();
            if (data.success && data.authorization_url) {
                window.location.href = data.authorization_url;
            }
        } catch (error) {
            alert('Payment initialization failed');
            setPaying(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;
    }

    if (!order) {
        return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Order not found</div>;
    }

    const isPaid = order.status !== 'PENDING_PAYMENT';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Order Details
                </h1>

                <div className="space-y-6">
                    {/* Product Info */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Product Information</h2>
                        
                        {order.productPhoto && (
                            <img src={order.productPhoto} alt={order.itemName} className="w-full max-h-64 object-cover rounded-lg mb-4" />
                        )}
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Item:</span>
                                <span className="font-bold">{order.itemName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Price:</span>
                                <span className="font-bold text-emerald-400">₦{order.price}</span>
                            </div>
                            <div className="mt-4">
                                <span className="text-slate-400 block mb-2">Agreement Summary:</span>
                                <p className="text-sm bg-slate-900 p-3 rounded">{order.agreementSummary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                        <div className="space-y-2">
                            <div>
                                <span className="text-slate-400 block">Pickup:</span>
                                <span className="text-sm">{order.pickupAddress}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Delivery:</span>
                                <span className="text-sm">{order.deliveryAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Payment</h2>
                        {isPaid ? (
                            <div>
                                <div className="flex items-center gap-2 text-green-400 mb-4">
                                    <span>✓ Payment Confirmed</span>
                                </div>
                                <button
                                    onClick={() => router.push(`/order/${order.id}/track`)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                                >
                                    Track Your Order
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handlePay}
                                disabled={paying}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded font-bold"
                            >
                                {paying ? 'Processing...' : `Pay ₦${order.price} via Paystack`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
