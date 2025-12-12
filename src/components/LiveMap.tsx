"use client";
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface LiveMapProps {
    orderId: string;
    deliveryAddress: string;
}

interface Location {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export default function LiveMap({ orderId, deliveryAddress }: LiveMapProps) {
    const [riderLocation, setRiderLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        // Connect to Socket.io for real-time updates
        const socket = require('socket.io-client')();

        // Join order room
        socket.emit('join-room', `order-${orderId}`);

        // Listen for location updates
        socket.on('location-updated', (location: Location) => {
            console.log('📍 Received location update:', location);
            setRiderLocation(location);
            setIsLoading(false);

            // Pan map to new location if map is ready
            if (mapRef.current) {
                mapRef.current.setView([location.latitude, location.longitude], 15);
            }
        });

        // Fetch initial location from API endpoint
        const fetchInitialLocation = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                const data = await response.json();
                
                if (data.success && data.order?.riderLocation) {
                    setRiderLocation(data.order.riderLocation);
                    setIsLoading(false);
                } else {
                    // No location yet, wait for Socket.io updates
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching initial location:', error);
                setIsLoading(false);
            }
        };

        fetchInitialLocation();

        return () => {
            socket.emit('leave-room', `order-${orderId}`);
            socket.disconnect();
        };
    }, [orderId]);

    if (typeof window === 'undefined') {
        return <div className="bg-slate-800 rounded-lg p-8 text-center">Loading map...</div>;
    }

    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
                <div className="animate-pulse text-slate-400">
                    🗺️ Waiting for rider location...
                </div>
            </div>
        );
    }

    if (!riderLocation) {
        return (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
                <div className="text-slate-400">
                    📍 Rider location will appear when delivery starts
                </div>
            </div>
        );
    }

    const position: [number, number] = [riderLocation.latitude, riderLocation.longitude];
    const lastUpdateTime = new Date(riderLocation.timestamp).toLocaleTimeString();

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">📍 Live Rider Location</h3>
                <span className="text-xs text-slate-400">
                    Updated: {lastUpdateTime}
                </span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-700" style={{ height: '400px' }}>
                <MapContainer
                    center={position}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <div className="text-sm">
                                <strong>🏍️ Rider Location</strong>
                                <br />
                                Accuracy: ±{Math.round(riderLocation.accuracy)}m
                                <br />
                                Updated: {lastUpdateTime}
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800 rounded p-2">
                <strong>📦 Delivering to:</strong> {deliveryAddress}
            </div>
        </div>
    );
}
