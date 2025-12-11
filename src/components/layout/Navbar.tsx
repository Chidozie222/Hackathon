"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide navbar on dashboard pages roughly (optional, but requested for "perfect UI")
    // Actually, distinct navs are better. This is the Public Navbar.
    if (pathname.includes('/dashboard')) return null;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'
        }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        TL
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        TrustLock
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/seller/register" className="text-slate-300 hover:text-white transition hover:scale-105">
                        Become a Seller
                    </Link>
                    <Link href="/rider/register" className="text-slate-300 hover:text-white transition hover:scale-105">
                        Join as Rider
                    </Link>
                    <Link 
                        href="/signin" 
                        className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition hover:shadow-lg hover:border-slate-500"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
