"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function RiderTempDashboard() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [scanAction, setScanAction] = useState<'pickup' | 'start-delivery' | null>(null);
    const [scanError, setScanError] = useState<string>('');
    const [scanSuccess, setScanSuccess] = useState<string>('');
    const scannerRef = useRef<any>(null);
    const scannerElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch order associated with this rider token
        // For now, we need to get the orderId from somewhere
        // In a real app, the token would map to an order
        // Let's check if there's an orderId in the URL params
        const fetchOrder = async () => {
            // Try to get orderId from localStorage or query params
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');
            
            if (orderId) {
                const response = await fetch(`/api/orders/${orderId}`);
                const data = await response.json();
                if (data.success) {
                    setOrder(data.order);
                }
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [params.token]);

    const startScanner = async (action: 'pickup' | 'start-delivery') => {
        setScanning(true);
        setScanAction(action);
        setScanError('');
        setScanSuccess('');
        
        try {
            // Dynamically import html5-qrcode
            const { Html5Qrcode } = await import('html5-qrcode');
            
            if (scannerElementRef.current) {
                const scanner = new Html5Qrcode("qr-reader-rider");
                scannerRef.current = scanner;
                
                await scanner.start(
                    { facingMode: "environment" }, // Use back camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        // Successfully scanned
                        handleScan(decodedText, action);
                        stopScanner();
                    },
                    (errorMessage) => {
                        // Scanning errors (can be ignored)
                    }
                ).catch((err) => {
                    setScanError('Unable to access camera. Please allow camera permissions.');
                    setScanning(false);
                });
            }
        } catch (err) {
            setScanError('Failed to initialize scanner');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setScanning(false);
        setScanAction(null);
    };

    const openNavigation = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    };

    const handleScan = async (scannedData: string, action: 'pickup' | 'start-delivery') => {
        try {
            const response = await fetch('/api/orders/rider-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: scannedData, // The QR code contains the order ID
                    scannedData: scannedData,
                    action: action
                })
            });

            const result = await response.json();

            if (result.success) {
                setScanSuccess(result.message);
                
                // Refresh order data
                const orderResponse = await fetch(`/api/orders/${scannedData}`);
                const orderData = await orderResponse.json();
                if (orderData.success) {
                    setOrder(orderData.order);
                }
            } else {
                setScanError(result.error || 'Failed to process scan');
            }
        } catch (error) {
            setScanError('Network error. Please try again.');
        }
    };

    useEffect(() => {
        // Cleanup scanner on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    // Check if access token is expired (after delivery)
    if (order && (order.riderAccessToken === 'EXPIRED' || order.status === 'DELIVERED')) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-slate-800 p-8 rounded-xl border border-red-600">
                        <div className="text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold mb-4 text-red-400">Access Link Expired</h1>
                        <p className="text-slate-300 mb-6">
                            This delivery has been completed and the access link has been disabled for security and data efficiency.
                        </p>
                        <div className="bg-emerald-900/20 border border-emerald-600 rounded p-4">
                            <p className="text-emerald-300">✅ Order successfully delivered!</p>
                            <p className="text-sm text-slate-400 mt-2">Thank you for using our delivery service.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-xl text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">🏍️ Rider Dashboard</h1>
                    <p className="text-lg">Personal Rider Access</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-purple-500 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-purple-400">Welcome, Rider!</h2>
                    <p className="text-slate-400 mb-4">
                        This is your temporary access dashboard. The seller has assigned you to handle this delivery.
                    </p>
                    <div className="bg-slate-900 p-4 rounded">
                        <p className="text-sm text-slate-500">Access Token:</p>
                        <p className="font-mono text-xs break-all">{params.token}</p>
                    </div>
                </div>

                {/* Order Details */}
                {order && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                        <h2 className="text-xl font-bold mb-4">📦 Order Information</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Order ID:</span>
                                <span className="font-mono text-xs">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Item:</span>
                                <span className="font-bold">{order.itemName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className="font-bold text-purple-400">{order.status}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Section */}
                {order && (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-blue-600">
                            <h3 className="text-lg font-bold mb-2">📍 Pickup Location</h3>
                            <p className="text-slate-300 text-sm mb-4 bg-slate-900 p-2 rounded">{order.pickupAddress}</p>
                            <button
                                onClick={() => openNavigation(order.pickupAddress)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition"
                            >
                                🗺️ Navigate to Pickup
                            </button>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-emerald-600">
                            <h3 className="text-lg font-bold mb-2">📍 Delivery Location</h3>
                            <p className="text-slate-300 text-sm mb-4 bg-slate-900 p-2 rounded">{order.deliveryAddress}</p>
                            <button
                                onClick={() => openNavigation(order.deliveryAddress)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition"
                            >
                                🗺️ Navigate to Delivery
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6">
                    {/* QR Scanner Section */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">📱 QR Code Scanner</h3>
                        
                        {order && (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') ? (
                            // Show completion message instead of scanner
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">
                                    {order.status === 'DELIVERED' ? '✅' : '🚚'}
                                </div>
                                <p className="text-2xl font-bold mb-2">
                                    {order.status === 'DELIVERED' ? 'Delivery Completed!' : 'Package In Transit'}
                                </p>
                                <p className="text-slate-400">
                                    {order.status === 'DELIVERED' 
                                        ? 'The buyer has confirmed delivery. Great job!' 
                                        : 'You have picked up the package. Deliver it to the buyer - they will scan to confirm receipt.'}
                                </p>
                            </div>
                        ) : !scanning ? (
                            <>
                                <p className="text-slate-400 mb-4">
                                    Scan the QR code on the package to confirm pickup.
                                </p>
                                <button 
                                    onClick={() => startScanner('pickup')}
                                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={order && order.status !== 'PAID'}
                                >
                                    📦 Scan QR Code to Confirm Pickup
                                </button>
                                {order && order.status === 'PAID' && (
                                    <p className="text-xs text-slate-500 mt-4 text-center">
                                        ✅ Ready to scan for pickup
                                    </p>
                                )}
                            </>
                        ) : (
                            <div>
                                <div className="text-center mb-4">
                                    <p className="text-xl font-bold mb-2">
                                        📦 Scan for Pickup
                                    </p>
                                    <p className="text-sm text-slate-400">Point camera at QR code on package</p>
                                </div>
                                <div id="qr-reader-rider" ref={scannerElementRef} className="rounded-lg overflow-hidden"></div>
                                <button
                                    onClick={stopScanner}
                                    className="w-full mt-4 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {scanError && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded text-center">
                                <p className="text-red-300">{scanError}</p>
                            </div>
                        )}

                        {scanSuccess && (
                            <div className="mt-4 p-4 bg-emerald-900/50 border border-emerald-500 rounded text-center">
                                <p className="text-emerald-300">✅ {scanSuccess}</p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">📋 Instructions</h3>
                        <ol className="space-y-3 text-slate-300">
                            <li className="flex gap-3">
                                <span className="font-bold text-purple-400">1.</span>
                                <span>Go to the pickup address and collect the package from the seller</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-purple-400">2.</span>
                                <span>Scan the QR code on the package to confirm pickup</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-purple-400">3.</span>
                                <span>Deliver the package to the buyer at the delivery address</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-purple-400">4.</span>
                                <span>The buyer will scan the QR code to confirm receipt and release payment</span>
                            </li>
                        </ol>
                    </div>

                    {/* Contact Info (Mock) */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">📞 Support</h3>
                        <p className="text-slate-400">
                            If you have any issues with this delivery, contact platform support:
                        </p>
                        <p className="text-emerald-400 font-bold mt-2">+234 800 000 0000</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
