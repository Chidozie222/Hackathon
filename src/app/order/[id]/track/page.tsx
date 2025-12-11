"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, joinOrderRoom, leaveOrderRoom } from '@/lib/socket';

export default function TrackOrder() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string>('');
    const [scanSuccess, setScanSuccess] = useState(false);
    const [scanAttempts, setScanAttempts] = useState(0);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const scannerRef = useRef<any>(null);
    const scannerElementRef = useRef<HTMLDivElement>(null);
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
            // Join order-specific room
            joinOrderRoom(params.id as string);

            // Listen for real-time updates
            socket.on('order-updated', (updatedOrder: any) => {
                console.log('📡 Real-time order update received');
                setOrder(updatedOrder);
            });

            return () => {
                // Cleanup
                socket.off('order-updated');
                leaveOrderRoom(params.id as string);
            };
        } else {
            // Fallback to polling if Socket.io not connected
            const interval = setInterval(fetchOrder, 5000);
            return () => clearInterval(interval);
        }
    }, [params.id, socket, isConnected]);

    const startScanner = async () => {
        setScanning(true);
        setScanError('');
        setScanSuccess(false);
        setScanAttempts(0);
        
        try {
            // Dynamically import html5-qrcode
            const { Html5Qrcode } = await import('html5-qrcode');
            
            if (scannerElementRef.current) {
                const scanner = new Html5Qrcode("qr-reader");
                scannerRef.current = scanner;
                
                await scanner.start(
                    { facingMode: "environment" }, // Use back camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        // Successfully scanned
                        console.log('QR Code scanned:', decodedText);
                        handleScan(decodedText);
                        stopScanner();
                    },
                    (errorMessage) => {
                        // Increment scan attempts to show activity
                        setScanAttempts(prev => prev + 1);
                    }
                ).catch((err) => {
                    console.error('Scanner error:', err);
                    setScanError('Unable to access camera. Please allow camera permissions.');
                    setScanning(false);
                    setShowManualInput(true);
                });
            }
        } catch (err) {
            console.error('Scanner init error:', err);
            setScanError('Failed to initialize scanner');
            setScanning(false);
            setShowManualInput(true);
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
    };

    const handleScan = async (scannedData: string) => {
        try {
            console.log('Processing scan:', scannedData, 'Expected:', params.id);
            
            const response = await fetch('/api/orders/confirm-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: params.id,
                    scannedData: scannedData
                })
            });

            const result = await response.json();
            console.log('Scan result:', result);

            if (result.success) {
                setScanSuccess(true);
                setScanError('');
                // Refresh order data
                const orderResponse = await fetch(`/api/orders/${params.id}`);
                const orderData = await orderResponse.json();
                if (orderData.success) {
                    setOrder(orderData.order);
                }
            } else {
                setScanError(result.error || 'Failed to confirm delivery');
            }
        } catch (error: any) {
            console.error('Scan handler error:', error);
            setScanError('Network error. Please try again.');
        }
    };

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            handleScan(manualInput.trim());
            setShowManualInput(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        setCancelling(true);
        try {
            // Request cancellation
            const res = await fetch('/api/dispute/request-cancellation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: params.id,
                    reason: cancelReason
                })
            });

            const data = await res.json();
            if (data.success) {
                // Trigger AI analysis
                const analyzeRes = await fetch('/api/dispute/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: params.id })
                });

                const analyzeData = await analyzeRes.json();
                if (analyzeData.success) {
                    setShowCancelModal(false);
                    alert(`Order cancelled. AI Decision: ${analyzeData.decision === 'REFUND_BUYER' ? 'You will be refunded' : 'Seller will be paid'}.\n\nReason: ${analyzeData.explanation}`);
                    // Refresh order
                    fetch(`/api/orders/${params.id}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                setOrder(data.order);
                            }
                        });
                }
            } else {
                alert(data.error || 'Failed to cancel order');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setCancelling(false);
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

    if (!order) {
        return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;
    }

    const statusSteps = [
        { key: 'PAID', label: 'Payment Confirmed', icon: '💳' },
        { key: 'PICKED_UP', label: 'Picked Up by Rider', icon: '📦' },
        { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
        { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Track Your Order
                </h1>
                
                {/* Live Indicator */}
                {isConnected ? (
                    <div className="mb-6 bg-emerald-900/20 border border-emerald-600 rounded-lg p-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-300 text-sm font-bold">🔴 LIVE - Real-time updates enabled</span>
                    </div>
                ) : (
                    <div className="mb-6 bg-slate-800 border border-slate-600 rounded-lg p-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                        <span className="text-slate-400 text-sm">Connecting to real-time updates...</span>
                    </div>
                )}

                {/* Progress Timeline */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                    <h2 className="text-xl font-bold mb-6">Delivery Status</h2>
                    <div className="space-y-4">
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            
                            return (
                                <div key={step.key} className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                        isCompleted ? 'bg-emerald-600' : 'bg-slate-700'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold ${isCurrent ? 'text-emerald-400' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                                            {step.label}
                                        </p>
                                        {isCurrent && <p className="text-sm text-emerald-400">Current Status</p>}
                                    </div>
                                    {isCompleted && <span className="text-emerald-400">✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                    <h2 className="text-xl font-bold mb-4">Order Details</h2>
                    {order.productPhoto && (
                        <img src={order.productPhoto} alt={order.itemName} className="w-full max-h-48 object-cover rounded-lg mb-4" />
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
                            <span className="text-slate-400 block mb-2">Delivery Address:</span>
                            <p className="text-sm bg-slate-900 p-3 rounded">{order.deliveryAddress}</p>
                        </div>
                        
                        {/* Agreement Summary */}
                        <div className="mt-4">
                            <span className="text-slate-400 block mb-2">📝 Agreement Summary:</span>
                            <p className="text-sm bg-slate-900 p-3 rounded border border-blue-600">{order.agreementSummary}</p>
                            {order.agreementHash && (
                                <div className="mt-2 text-xs text-slate-500">
                                    <p>🔒 Blockchain Hash: {order.agreementHash.substring(0, 16)}...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Cancel Order Button */}
                    {order.status !== 'DELIVERED' && order.status !== 'DISPUTED' && !order.cancellationRequested && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition"
                            >
                                🚫 Cancel Order
                            </button>
                        </div>
                    )}
                    
                    {/* Dispute Status */}
                    {order.disputeResolution && (
                        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500 rounded">
                            <p className="font-bold text-yellow-300 mb-2">⚖️ Dispute Resolved</p>
                            <p className="text-sm mb-2">
                                <strong>AI Decision:</strong> {order.disputeResolution.aiDecision === 'REFUND_BUYER' ? 'Refund Buyer' : 'Pay Seller'}
                            </p>
                            <p className="text-sm text-slate-300">
                                {order.disputeResolution.aiExplanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Cancel Order Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Please provide a reason for cancellation. Our AI will analyze your reason against the agreement summary to determine if a refund is warranted.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Cancellation Reason *</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-red-500 outline-none h-32"
                                    placeholder="E.g., 'Item is damaged', 'Wrong item received', 'Not as described'..."
                                />
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-500 rounded p-3 mb-4 text-sm">
                                <p className="text-yellow-300">
                                    ⚠️ <strong>Note:</strong> If your concern was mentioned in the agreement summary, you may not receive a refund.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling || !cancelReason.trim()}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded font-bold transition"
                                >
                                    {cancelling ? 'Processing...' : 'Submit Cancellation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rider Info (Mock) */}
                {(order.status === 'PICKED_UP' || order.status === 'IN_TRANSIT') && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                        <h2 className="text-xl font-bold mb-4">Rider Information</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Rider:</span>
                                <span>John Delivery</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Phone:</span>
                                <span>+234 800 000 0000</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Vehicle:</span>
                                <span>Motorcycle - ABC 123</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-slate-900 rounded">
                            <p className="text-sm text-slate-400 mb-2">📍 Current Location (Mock)</p>
                            <p className="text-sm">En route to delivery address...</p>
                        </div>
                    </div>
                )}

                {/* Blockchain Escrow Details */}
                {order.escrowAddress && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-emerald-500 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-emerald-400">⛓️ Blockchain Escrow</h2>
                        <p className="text-slate-400 mb-4 text-sm">
                            Your payment has been secured on the Ethereum blockchain in a smart contract escrow.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <span className="text-slate-400 text-sm block mb-1">Escrow Contract Address:</span>
                                <div className="bg-slate-900 p-3 rounded border border-emerald-600 font-mono text-xs break-all">
                                    {order.escrowAddress}
                                </div>
                                <a
                                    href={`https://sepolia.etherscan.io/address/${order.escrowAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 text-xs mt-1 inline-block"
                                >
                                    🔗 View on Etherscan →
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-400 text-sm block mb-1">Payment Reference:</span>
                                <div className="bg-slate-900 p-3 rounded border border-slate-600 font-mono text-xs break-all">
                                    {order.paymentReference || 'N/A'}
                                </div>
                            </div>
                            <div className="bg-emerald-900/30 border border-emerald-500 rounded p-3 text-sm">
                                <p className="text-emerald-300">
                                    ✅ <strong>Funds secured:</strong> Your payment is held safely in the blockchain until delivery is confirmed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Scanner Section */}
                {(order.status === 'IN_TRANSIT' || order.status === 'PICKED_UP') && !scanSuccess && (
                    <div className="mt-6 bg-gradient-to-r from-emerald-600 to-blue-600 p-6 rounded-xl">
                        {!scanning && !showManualInput ? (
                            <div className="text-center">
                                <p className="text-xl font-bold mb-2">📦 Package Arrived?</p>
                                <p className="text-sm mb-4">Scan the QR code on the package to confirm delivery and release payment to the seller.</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={startScanner}
                                        className="w-full md:w-auto px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition"
                                    >
                                        📱 Scan QR Code
                                    </button>
                                    <button
                                        onClick={() => setShowManualInput(true)}
                                        className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition text-sm"
                                    >
                                        ⌨️ Enter Order ID Manually
                                    </button>
                                </div>
                            </div>
                        ) : scanning ? (
                            <div>
                                <div className="text-center mb-4">
                                    <p className="text-xl font-bold mb-2">📸 Scanning...</p>
                                    <p className="text-sm mb-2">Point camera at QR code on the package</p>
                                    {scanAttempts > 0 && (
                                        <p className="text-xs opacity-75">
                                            {scanAttempts < 50 ? '🔍 Looking for QR code...' : 
                                             scanAttempts < 150 ? '👀 Still scanning...' : 
                                             '⏳ Having trouble? Try better lighting or manual input'}
                                        </p>
                                    )}
                                </div>
                                <div id="qr-reader" ref={scannerElementRef} className="rounded-lg overflow-hidden mb-4"></div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={stopScanner}
                                        className="flex-1 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition"
                                    >
                                        Cancel
                                    </button>
                                    {scanAttempts > 150 && (
                                        <button
                                            onClick={() => {
                                                stopScanner();
                                                setShowManualInput(true);
                                            }}
                                            className="flex-1 px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition"
                                        >
                                            Manual Input
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : showManualInput ? (
                            <div className="text-center">
                                <p className="text-xl font-bold mb-2">⌨️ Manual Entry</p>
                                <p className="text-sm mb-4">Enter the Order ID from the package:</p>
                                <div className="max-w-md mx-auto space-y-3">
                                    <input
                                        type="text"
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        placeholder="Order ID"
                                        className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg font-mono text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setShowManualInput(false);
                                                setManualInput('');
                                            }}
                                            className="flex-1 px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleManualSubmit}
                                            disabled={!manualInput.trim()}
                                            className="flex-1 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        
                        {scanError && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded text-center">
                                <p className="text-red-300 font-bold mb-2">{scanError}</p>
                                {!showManualInput && (
                                    <button
                                        onClick={() => {
                                            setScanError('');
                                            setShowManualInput(true);
                                        }}
                                        className="text-sm underline hover:no-underline"
                                    >
                                        Try manual input instead
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Success Message */}
                {scanSuccess && (
                    <div className="mt-6 bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-xl text-center">
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="text-xl font-bold mb-2">Delivery Confirmed!</p>
                        <p className="text-sm">Payment has been released to the seller. Thank you!</p>
                    </div>
                )}

                {/* Delivered State */}
                {order.status === 'DELIVERED' && !scanSuccess && (
                    <div className="mt-6 bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-xl text-center">
                        <p className="text-3xl mb-2">✅</p>
                        <p className="text-xl font-bold mb-2">Order Delivered!</p>
                        <p className="text-sm">This order has been completed. Thank you for your purchase!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
