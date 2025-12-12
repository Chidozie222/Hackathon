"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SellerSidebar from '@/components/layout/SellerSidebar';
import { useSocket, joinSellerDashboard } from '@/lib/socket';

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({ pending: 0, paid: 0, inTransit: 0, delivered: 0, revenue: 0 });
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
                const fetchedOrders = data.orders || [];
                setOrders(fetchedOrders);
                
                // Calculate stats
                const newStats = {
                    pending: fetchedOrders.filter((o: any) => o.status === 'PENDING_PAYMENT').length,
                    paid: fetchedOrders.filter((o: any) => o.status === 'PAID').length,
                    inTransit: fetchedOrders.filter((o: any) => o.status === 'IN_TRANSIT').length,
                    delivered: fetchedOrders.filter((o: any) => o.status === 'DELIVERED').length,
                    revenue: fetchedOrders
                        .filter((o: any) => o.status === 'DELIVERED')
                        .reduce((acc: number, curr: any) => acc + Number(curr.price), 0)
                };
                setStats(newStats);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'PENDING_PAYMENT': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            'PAID': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'IN_TRANSIT': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            'DELIVERED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'DISPUTED': 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        return styles[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    };

    // Socket.io for Real-time Notifications
    const { socket, isConnected } = useSocket();
    
    useEffect(() => {
        if (isConnected && socket && user) {
            joinSellerDashboard(user.id);

            socket.on('seller-order-update', (updatedOrder: any) => {
                console.log('🔔 Order Update:', updatedOrder);
                
                // Show notification (browser notification if enabled)
                if (Notification.permission === 'granted') {
                    let msg = `Order ${updatedOrder.itemName} updated to ${updatedOrder.status}`;
                    if (updatedOrder.riderId && !updatedOrder.acceptedAt) { 
                         // Check if it was just unassigned (cancel) is tricky with just 'updatedOrder'
                         // But if status is PAID and riderId is missing/empty, it was cancelled.
                         // Actually updatedOrder object might not have previous state.
                         // Let's just say "Order Status Updated"
                    }
                    if (updatedOrder.status === 'IN_TRANSIT') msg = `Rider picked up ${updatedOrder.itemName}`;
                    
                    // Specific check for acceptance (status is still PAID but riderId is set)
                    if (updatedOrder.riderId && updatedOrder.status === 'PAID') {
                         msg = `Rider accepted ${updatedOrder.itemName}`;
                    }
                    
                    new Notification('Order Update', { body: msg, icon: '/icon.png' });
                }

                // Refresh orders to update the list UI
                fetchOrders(user.id);
                
                // Optional: Show in-app toast here
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 z-50 flex items-center gap-3';
                toast.innerHTML = `<span>🔔</span> <div><p class="font-bold">Order Update</p><p class="text-xs text-purple-200">${updatedOrder.itemName} is now ${updatedOrder.status.replace(/_/g, ' ')}</p></div>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 500);
                }, 4000);
            });

            return () => {
                socket.off('seller-order-update');
            };
        }
    }, [isConnected, socket, user]);

    if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <SellerSidebar />
            
            <main className="md:ml-64 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
                        <p className="text-slate-400">Welcome back, <span className="text-white font-medium">{user.name}</span></p>
                    </div>
                    <button
                        onClick={() => router.push('/seller/create-order')}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                    >
                        <span>+</span> Create New Order
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Pending Payment', value: stats.pending, color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
                        { label: 'Ready to Ship', value: stats.paid, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
                        { label: 'In Transit', value: stats.inTransit, color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
                        { label: 'Delivered', value: stats.delivered, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm transition hover:-translate-y-1`}>
                            <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                            <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Revenue Card (Optional nice-to-have) */}
                <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h3 className="text-slate-400 font-medium mb-2 relative z-10">Total Revenue (Delivered)</h3>
                    <div className="text-4xl font-bold text-white relative z-10">₦{stats.revenue.toLocaleString()}</div>
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Recent Orders</h2>
                        <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">📦</div>
                            <p className="text-slate-400 mb-4">No orders placed yet.</p>
                            <button
                                onClick={() => router.push('/seller/create-order')}
                                className="text-emerald-400 font-bold hover:underline"
                            >
                                Create your first order
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/50 text-slate-400 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10).map(order => (
                                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white">{order.itemName}</div>
                                                <div className="text-slate-500 text-xs">ID: {order.id.substring(0, 8)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">₦{parseInt(order.price).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/seller/order/${order.id}`)}
                                                    className="text-slate-300 hover:text-white font-medium hover:bg-slate-800 px-3 py-1 rounded transition"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
