"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MockCheckout() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    const amount = searchParams?.get('amount');
    const reference = searchParams?.get('reference');
    const orderId = searchParams?.get('orderId');

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Auto-redirect to verify endpoint WITH orderId
                    window.location.href = `/api/payment/verify?reference=${reference}&orderId=${orderId}`;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [reference]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">💳</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Mock Paystack Checkout</h1>
                    <p className="text-gray-600 mb-6">Demo Payment Gateway</p>
                    
                    <div className="bg-gray-100 p-6 rounded-xl mb-6">
                        <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
                        <p className="text-4xl font-bold text-emerald-600">₦{amount}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            🎭 <strong>Demo Mode:</strong> This is a simulated payment. No real transaction will occur.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-mono text-xs text-gray-800">{reference?.slice(0, 16)}...</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-green-600 font-bold">✓ Payment Successful</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg mb-4">
                        <p className="text-sm mb-2">Auto-redirecting in</p>
                        <p className="text-5xl font-bold">{countdown}</p>
                    </div>

                    <p className="text-xs text-gray-500">
                        Redirecting to order tracking...
                    </p>
                </div>
            </div>
        </div>
    );
}
