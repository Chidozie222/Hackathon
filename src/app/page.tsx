"use client";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20"></div>
                <div className="relative max-w-7xl mx-auto px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                            Secure Delivery Platform
                        </h1>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Escrow-backed delivery system with blockchain security. Pay only when you receive your product.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/seller/register"
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-lg transition"
                            >
                                🛍️ Register as Seller
                            </a>
                            <a
                                href="/rider/register"
                                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-lg transition"
                            >
                                🏍️ Register as Rider
                            </a>
                        </div>
                        <div className="flex justify-center mt-4">
                            <a
                                href="/signin"
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition"
                            >
                                🔑 Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-7xl mx-auto px-8 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-4">🛍️</div>
                        <h3 className="text-xl font-bold mb-2">Sellers Create Orders</h3>
                        <p className="text-slate-400">
                            Upload product details, set price, add delivery addresses, and generate a unique QR code.
                        </p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-4">💳</div>
                        <h3 className="text-xl font-bold mb-2">Buyers Pay Securely</h3>
                        <p className="text-slate-400">
                            Payment is held in escrow until delivery is confirmed. Track your order in real-time.
                        </p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-xl font-bold mb-2">QR Verification</h3>
                        <p className="text-slate-400">
                            Riders scan QR at pickup, buyers scan at delivery. Funds auto-release on confirmation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
