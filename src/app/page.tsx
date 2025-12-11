"use client";
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
            <Navbar />
            
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] left-[20%] w-[2px] h-[2px] bg-white rounded-full animate-ping"></div>
                <div className="absolute top-[60%] right-[20%] w-[3px] h-[3px] bg-emerald-500 rounded-full animate-ping delay-500"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-sm animate-fade-in-up">
                        <span className="text-emerald-400 text-sm font-semibold tracking-wide uppercase">✨ Blockchain-Secured Delivery</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                        Trust in Every <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                            Transaction
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        The world's first decentralized delivery platform. Funds are held in smart contract escrow until the buyer confirms receipt. Zero fraud, 100% peace of mind.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <Link
                            href="/seller/register"
                            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Selling 
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </Link>
                        
                        <Link
                            href="/rider/register"
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <span>Earn as Rider</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
                        {[
                            { label: "Active Users", value: "10k+" },
                            { label: "Secured Volume", value: "$2M+" },
                            { label: "Avg Delivery", value: "24m" },
                            { label: "Fraud Rate", value: "0%" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-slate-500 text-sm uppercase tracking-wider font-semibold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-900/50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Security First Architecture</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            We've reimagined last-mile delivery by integrating blockchain escrow directly into the workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "💼",
                                title: "Smart Escrow",
                                desc: "Funds are locked in a smart contract. The seller sees proof of funds, but can't access them until delivery.",
                                color: "emerald"
                            },
                            {
                                icon: "🤖",
                                title: "AI Disputes",
                                desc: "Conflict? Our impartial AI analyzes evidence and blockchain agreements to resolve disputes in seconds.",
                                color: "blue"
                            },
                            {
                                icon: "📱",
                                title: "QR Chain",
                                desc: "A cryptographic chain of custody. Pickup and delivery are verified on-chain via encrypted QR codes.",
                                color: "purple"
                            }
                        ].map((feature, i) => (
                            <div 
                                key={i}
                                className="group p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto p-12 rounded-3xl bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Ready to Ship Securely?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of sellers and riders building the future of decentralized commerce.
                        </p>
                        <Link
                            href="/seller/register"
                            className="inline-block px-10 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-full font-bold text-lg transition hover:scale-105 shadow-xl"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>

             {/* Footer */}
             <footer className="py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} SecureDrop Protocol. Built for ETH Lagos.</p>
            </footer>
        </div>
    );
}
