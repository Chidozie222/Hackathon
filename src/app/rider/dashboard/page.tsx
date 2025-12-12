"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, joinRiderDashboard } from '@/lib/socket';
import { useToast } from '@/context/ToastContext';
import GPSTracker from '@/components/GPSTracker';

export default function RiderDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [completedJobs, setCompletedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);
    const { socket, isConnected } = useSocket();
    const { showToast } = useToast();

    useEffect(() => {
        // Check if user is logged in
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/signin');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.type !== 'RIDER') {
            showToast('Access denied. Riders only.', 'error');
            router.push('/');
            return;
        }

        setUser(userData);
        fetchJobs(userData.id);

        // Set up Socket.io real-time updates
        if (isConnected && socket) {
            joinRiderDashboard(userData.id);

            // Listen for new jobs
            socket.on('new-job', (job: any) => {
                console.log('📡 New job available!', job);
                setAvailableJobs(prev => [job, ...prev]);
                showToast(`New Job: ${job.itemName} - ₦${job.price}`, 'success');
            });

            // Listen for rider-specific job updates
            socket.on('rider-job-update', (job: any) => {
                console.log('📡 Job update received');
                fetchJobs(userData.id); // Refresh jobs
            });

            // Listen for taken jobs (remove from available)
            socket.on('job-taken', ({ id }: { id: string }) => {
                console.log(`📡 Job ${id} taken by another rider`);
                setAvailableJobs(prev => prev.filter(job => (job.id !== id && job._id !== id)));
            });

            return () => {
                socket.off('new-job');
                socket.off('rider-job-update');
                socket.off('job-taken');
            };
        } else {
            // Fallback to polling
            const interval = setInterval(() => fetchJobs(userData.id), 30000);
            return () => clearInterval(interval);
        }
    }, [router, socket, isConnected]);

    const fetchJobs = async (riderId: string) => {
        try {
            const res = await fetch(`/api/jobs/list?riderId=${riderId}`);
            const data = await res.json();
            if (data.success) {
                setAvailableJobs(data.availableJobs);
                setActiveJobs(data.activeJobs);
                setCompletedJobs(data.completedJobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (orderId: string) => {
        if (!user || (!user.id && !user._id)) {
            showToast('User profile error. Please sign out and sign in again.', 'error');
            return;
        }
        
        const riderId = user.id || user._id;

        console.log('Attempting to accept job:', { orderId, riderId });

        setAccepting(orderId);
        try {
            const res = await fetch('/api/jobs/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, riderId })
            });

            const data = await res.json();
            if (data.success) {
                await fetchJobs(riderId);
                showToast('Job accepted successfully!', 'success');
            } else {
                console.error('Accept job failed:', data);
                showToast(data.error || 'Failed to accept job', 'error');
            }
        } catch (error) {
            console.error('Accept job network error:', error);
            showToast('Network error. Check console for details.', 'error');
        } finally {
            setAccepting(null);
        }
    };

    const openNavigation = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            🏍️ Rider Dashboard
                        </h1>
                        <p className="text-slate-400">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchJobs(user?.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-bold transition flex items-center gap-2"
                        >
                            <span>🔄</span> Refresh
                        </button>
                        <button
                            onClick={() => router.push('/rider/settings')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-bold transition flex items-center gap-2"
                        >
                            <span>⚙️</span> Settings
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-blue-600">
                        <div className="text-3xl font-bold text-blue-400">{availableJobs.length}</div>
                        <div className="text-slate-400">Available Jobs</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-purple-600">
                        <div className="text-3xl font-bold text-purple-400">{activeJobs.length}</div>
                        <div className="text-slate-400">Active Jobs</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-emerald-600">
                        <div className="text-3xl font-bold text-emerald-400">{completedJobs.length}</div>
                        <div className="text-slate-400">Completed</div>
                    </div>
                </div>

                {/* Available Jobs */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">📋 Available Jobs</h2>
                    {availableJobs.length === 0 ? (
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
                            No available jobs at the moment. Check back soon!
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {availableJobs.map(job => (
                                <div key={job.id || job._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{job.itemName}</h3>
                                            <p className="text-emerald-400 font-bold">₦{job.price}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm mb-4">
                                        <div>
                                            <span className="text-slate-400">Pickup:</span>
                                            <p className="text-slate-200">{job.pickupAddress}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Delivery:</span>
                                            <p className="text-slate-200">{job.deliveryAddress}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAccept(job.id || job._id)}
                                        disabled={accepting === (job.id || job._id)}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded font-bold transition"
                                    >
                                        {accepting === (job.id || job._id) ? 'Accepting...' : '✓ Accept Job'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Jobs */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">🚚 Active Jobs</h2>
                    {activeJobs.length === 0 ? (
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
                            No active jobs. Accept a job from available jobs to get started!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeJobs.map(job => (
                                <div key={job.id || job._id} className="bg-slate-800 p-6 rounded-xl border border-purple-600">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{job.itemName}</h3>
                                            <p className="text-emerald-400 font-bold">₦{job.price}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded text-sm">
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-slate-400">Pickup:</span>
                                                <p className="text-slate-200">{job.pickupAddress}</p>
                                                <button
                                                    onClick={() => openNavigation(job.pickupAddress)}
                                                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition w-full"
                                                >
                                                    🗺️ Navigate to Pickup
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-slate-400">Delivery:</span>
                                                <p className="text-slate-200">{job.deliveryAddress}</p>
                                                <button
                                                    onClick={() => openNavigation(job.deliveryAddress)}
                                                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold transition w-full"
                                                >
                                                    🗺️ Navigate to Delivery
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* GPS Tracker for Active Deliveries */}
                                    <div className="mt-4">
                                        <GPSTracker
                                            orderId={job.id || job._id}
                                            riderId={user.id || user._id}
                                            isActive={job.status === 'PICKED_UP' || job.status === 'IN_TRANSIT'}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <button
                                            onClick={() => router.push(`/rider/temp/token?orderId=${job.id || job._id}`)}
                                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded font-bold transition"
                                        >
                                            📱 Open QR Scanner
                                        </button>
                                        
                                        {job.status === 'PAID' && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Are you sure you want to cancel this job? It will be made available to other riders.')) return;
                                                    try {
                                                        const res = await fetch('/api/jobs/cancel', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ orderId: job.id || job._id, riderId: user.id || user._id })
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            showToast('Job cancelled successfully.', 'info');
                                                            fetchJobs(user.id || user._id);
                                                        } else {
                                                            showToast(data.error || 'Failed to cancel job', 'error');
                                                        }
                                                    } catch (err) {
                                                        console.error('Cancel error:', err);
                                                        showToast('Failed to cancel job', 'error');
                                                    }
                                                }}
                                                className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded font-bold transition border border-red-700"
                                            >
                                                ✕ Cancel Job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Jobs */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">✅ Completed Jobs</h2>
                    {completedJobs.length === 0 ? (
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
                            No completed jobs yet. Complete your first delivery to see it here!
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedJobs.map(job => (
                                <div key={job.id || job._id} className="bg-slate-800 p-4 rounded-xl border border-emerald-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{job.itemName}</h3>
                                        <span className="text-emerald-400 font-bold">₦{job.price}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Delivered: {new Date(job.deliveryTime).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
