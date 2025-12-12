"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, joinOrderRoom, leaveOrderRoom } from '@/lib/socket';

export default function TrackOrder() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        const fetchOrder = () => {
            fetch(`/api/orders/${params?.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrder(data.order);
                    }
                });
        };

        // Initial fetch
        fetchOrder();

        // Join order room for real-time updates
        if (isConnected && socket) {
            joinOrderRoom(params?.id as string);

            // Listen for order updates
            socket.on('order-updated', (updatedOrder: any) => {
                console.log('📡 Real-time update received:', updatedOrder);
                setOrder(updatedOrder);
            });

            return () => {
                // Cleanup
                socket.off('order-updated');
                leaveOrderRoom(params?.id as string);
            };
        }
    }, [params?.id, socket, isConnected]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                {isConnected && (
                    <div className="bg-emerald-900/20 border border-emerald-600 rounded p-3 mb-4">
                        <p className="text-emerald-300 text-sm">🔴 Live - Real-time updates enabled</p>
                    </div>
                )}
                {/* Rest of your tracking component */}
                <h1 className="text-3xl font-bold">Track Your Order</h1>
                {order && (
                    <div className="mt-6 bg-slate-800 p-6 rounded-xl">
                        <p className="text-2xl font-bold">Status: {order.status}</p>
                        <p>Item: {order.itemName}</p>
                        <p>Price: ₦{order.price}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
