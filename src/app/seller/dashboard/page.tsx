"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/seller/register');
        } else {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchOrders(parsedUser.id);
        }
    }, [router]);

    const fetchOrders = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/orders/seller/${sellerId}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'PENDING_PAYMENT': 'bg-yellow-900 text-yellow-300',
            'PAID': 'bg-blue-900 text-blue-300',
            'IN_TRANSIT': 'bg-purple-900 text-purple-300',
            'DELIVERED': 'bg-emerald-900 text-emerald-300',
            'DISPUTED': 'bg-red-900 text-red-300'
        };
        return colors[status] || 'bg-slate-900 text-slate-300';
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                            Seller Dashboard
                        </h1>
                        <p className="text-slate-400">Welcome back, {user.name}</p>
                    </div>
                    <button
                        onClick={() => router.push('/seller/create-order')}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition"
                    >
                        + Create New Order
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-yellow-600">
                        <div className="text-3xl font-bold text-yellow-400">
                            {orders.filter(o => o.status === 'PENDING_PAYMENT').length}
                        </div>
                        <div className="text-slate-400 text-sm">Pending Payment</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-blue-600">
                        <div className="text-3xl font-bold text-blue-400">
                            {orders.filter(o => o.status === 'PAID').length}
                        </div>
                        <div className="text-slate-400 text-sm">Paid</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-purple-600">
                        <div className="text-3xl font-bold text-purple-400">
                            {orders.filter(o => o.status === 'IN_TRANSIT').length}
                        </div>
                        <div className="text-slate-400 text-sm">In Transit</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-emerald-600">
                        <div className="text-3xl font-bold text-emerald-400">
                            {orders.filter(o => o.status === 'DELIVERED').length}
                        </div>
                        <div className="text-slate-400 text-sm">Delivered</div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
                    
                    {loading ? (
                        <p className="text-center text-slate-400 py-8">Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 mb-4">No orders yet</p>
                            <button
                                onClick={() => router.push('/seller/create-order')}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition"
                            >
                                Create Your First Order
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.sort((a, b) => b.createdAt - a.createdAt).map(order => (
                                <div 
                                    key={order.id} 
                                    className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-emerald-600 transition cursor-pointer"
                                    onClick={() => router.push(`/seller/order/${order.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{order.itemName}</h3>
                                            <p className="text-slate-400 text-sm">
                                                Order ID: {order.id.substring(0, 8)}...
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold text-lg">₦{order.price}</p>
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-slate-500">Pickup:</span>
                                            <p className="text-slate-300">{order.pickupAddress}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Delivery:</span>
                                            <p className="text-slate-300">{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                                        <span className="text-xs text-slate-500">
                                            Created: {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/seller/order/${order.id}`);
                                            }}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold transition"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
