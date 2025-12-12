"use client";
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Navbar />
            
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-success/5 blur-[100px] animate-pulse delay-700"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-8 px-5 py-2 rounded-full bg-white border border-gray-200 shadow-sm animate-slide-in">
                        <span className="text-primary font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                            Live on Ethereum
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-white animate-slide-in" style={{ animationDelay: '0.1s' }}>
                        Decentralized Trust for <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Local Commerce
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in" style={{ animationDelay: '0.2s' }}>
                        The first delivery platform powered by smart contracts. Funds are held in escrow until the buyer verifies the delivery. Say goodbye to payment fraud.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-in" style={{ animationDelay: '0.3s' }}>
                        <Link
                            href="/seller/register"
                            className="group relative px-8 py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Selling 
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </Link>
                        
                        <Link
                            href="/rider/register"
                            className="px-8 py-4 bg-white hover:bg-gray-50 text-dark border border-gray-200 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-sm"
                        >
                            <span>Earn as Rider</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🔒",
                                title: "Smart Escrow",
                                desc: "No trust needed. Funds are locked on-chain and only released when the buyer confirms receipt via QR code.",
                                color: "bg-blue-900/20 text-blue-400"
                            },
                            {
                                icon: "⚡",
                                title: "Instant Settlements",
                                desc: "Riders and sellers get paid immediately upon delivery. No weekly payouts, no delays, direct to your wallet.",
                                color: "bg-green-900/20 text-green-400"
                            },
                            {
                                icon: "🛡️",
                                title: "Fraud Proof",
                                desc: "Every step is verified. AI analyzes dispute claims while the blockchain provides an immutable audit trail.",
                                color: "bg-purple-900/20 text-purple-400"
                            }
                        ].map((feature, i) => (
                            <div 
                                key={i}
                                className="group p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Application Flow */}
            <section className="py-24 bg-slate-900/30 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm">How it works</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 text-white">Secure Delivery in 3 Steps</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 via-primary/50 to-slate-700 transform -translate-y-1/2 z-0"></div>

                        {[
                            { step: "01", title: "Order & Pay", desc: "Buyer orders and pays into the Smart Contract Escrow." },
                            { step: "02", title: "Verify & Pickup", desc: "Rider scans QR code at pickup to verify chain of custody." },
                            { step: "03", title: "Deliver & Release", desc: "Buyer scans delivery QR. Contract releases funds instantly." }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 text-center">
                                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 shadow-xl flex items-center justify-center text-primary font-black text-2xl mb-6 transform transition-transform hover:scale-110">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                                <p className="text-gray-400 max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto p-12 rounded-3xl bg-dark text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/20 rounded-full blur-[80px]"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Ready to Ship with Trust?</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Join the decentralized revolution. Low fees, instant payments, and zero chargebacks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/seller/register"
                                className="px-10 py-4 bg-primary hover:bg-blue-600 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/50"
                            >
                                Get Started as Seller
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

             {/* Footer */}
             <footer className="py-12 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} TrustLock Protocol. Built for ETH Lagos.</p>
            </footer>
        </div>
    );
}
