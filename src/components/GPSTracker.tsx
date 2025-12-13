"use client";
import { useEffect, useState, useRef } from 'react';

interface GPSTrackerProps {
    orderId: string;
    riderId: string;
    isActive: boolean; // Only track when in PICKED_UP or IN_TRANSIT status
}

export default function GPSTracker({ orderId, riderId, isActive }: GPSTrackerProps) {
    const [tracking, setTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive) {
            stopTracking();
            return;
        }

        startTracking();

        return () => {
            stopTracking();
        };
    }, [isActive, orderId, riderId]);

    const startTracking = () => {
       if (!navigator.geolocation) {
            setError('GPS not supported by your browser');
            return;
        }

        console.log('📍 Starting GPS tracking for order:', orderId);
        setTracking(true);
        setError(null);

        // Watch position with high accuracy
        watchIdRef.current = navigator.geolocation.watchPosition(
            sendLocationUpdate,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );

        // Also send updates every 10 seconds as backup
        intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                sendLocationUpdate,
                handleError,
                { enableHighAccuracy: true }
            );
        }, 10000);
    };

    const stopTracking = () => {
        console.log('📍 Stopping GPS tracking');
        
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setTracking(false);
    };

    const sendLocationUpdate = async (position: GeolocationPosition) => {
        try {
            const { latitude, longitude, accuracy } = position.coords;

            const response = await fetch('/api/rider/update-location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    riderId,
                    latitude,
                    longitude,
                    accuracy
                })
            });

            if (response.ok) {
                setLastUpdate(new Date());
                setError(null);
                console.log(`📍 Location sent: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
            } else {
                const data = await response.json();
                console.error('Failed to send location:', data.error);
            }
        } catch (err: any) {
            console.error('Error sending location:', err);
            setError('Failed to send location update');
        }
    };

    const handleError = (err: GeolocationPositionError) => {
        let errorMsg = 'Unable to get location';
        
        switch (err.code) {
            case err.PERMISSION_DENIED:
                errorMsg = 'Location permission denied. Please enable location access.';
                break;
            case err.POSITION_UNAVAILABLE:
                errorMsg = 'Location information unavailable';
                break;
            case err.TIMEOUT:
                errorMsg = 'Location request timed out';
                break;
        }

        setError(errorMsg);
        console.error('GPS Error:', errorMsg);
    };

    return (
        <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                    {tracking ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    ) : (
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    )}
                    GPS Tracker
                </h3>
                <span className="text-sm text-slate-400">
                    {tracking ? 'Active' : 'Inactive'}
                </span>
            </div>

            {error && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-500 rounded p-2 mb-2">
                    ⚠️ {error}
                </div>
            )}

            {tracking && !error && lastUpdate && (
                <div className="text-xs text-slate-400">
                    Last update: {lastUpdate.toLocaleTimeString()}
                </div>
            )}

            {!isActive && (
                <div className="text-sm text-slate-500">
                    GPS tracking will activate when you pick up the order
                </div>
            )}
        </div>
    );
}
