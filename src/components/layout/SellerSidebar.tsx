"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SellerSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/seller/create-order', label: 'New Order', icon: '📦' },
        { href: '/seller/settings', label: 'Settings', icon: '⚙️' }, // Placeholder
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-screen fixed top-0 left-0 pt-20">
            <div className="px-6 mb-8">
                <h2 className="text-xs uppercase text-slate-500 font-bold tracking-wider">Menu</h2>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                {links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link 
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span>{link.icon}</span>
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-800">
                <button 
                    onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/signin';
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/10 hover:text-red-300 rounded-xl w-full transition-colors"
                >
                    <span>🚪</span>
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
