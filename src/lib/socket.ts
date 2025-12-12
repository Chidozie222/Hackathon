"use client";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const initSocket = async () => {
            if (!socket) {
                await fetch('/api/socket');
                socket = io({
                    path: '/api/socket',
                    addTrailingSlash: false,
                    transports: ['polling', 'websocket'], // Force transport options
                });

                socket.on('connect', () => {
                    console.log('✅ Socket connected:', socket?.id);
                    setIsConnected(true);
                });

                socket.on('disconnect', () => {
                    console.log('❌ Socket disconnected');
                    setIsConnected(false);
                });

                socket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err);
                });
            } else {
                if (socket.connected) {
                    setIsConnected(true);
                }
            }
        };

        initSocket();
        
        // Cleanup listener only, do not disconnect global socket on component unmount
        // to persist connection across page navigations
        return () => {
            // Optional: remove specific listeners if needed, but keep connection
        };
    }, []);

    return { socket, isConnected };
};

export const joinOrderRoom = (orderId: string) => {
    if (socket && socket.connected) {
        socket.emit('join-order', orderId);
    }
};

export const leaveOrderRoom = (orderId: string) => {
    if (socket && socket.connected) {
        socket.emit('leave-order', orderId);
    }
};

export const joinRiderDashboard = (riderId: string) => {
    if (socket && socket.connected) {
        socket.emit('join-rider-dashboard', riderId);
    }
};

export const joinSellerDashboard = (sellerId: string) => {
    if (socket && socket.connected) {
        socket.emit('join-seller-dashboard', sellerId);
    }
};

export const updateRiderLocation = (orderId: string, lat: number, lng: number) => {
    if (socket && socket.connected) {
        socket.emit('rider-location', { orderId, lat, lng });
    }
};
