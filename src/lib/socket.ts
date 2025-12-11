"use client";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        socketInitializer();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const socketInitializer = async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Reuse existing connection if available
        if (socket?.connected) {
            setIsConnected(true);
            return socket;
        }

        // Initialize Socket.io
        await fetch('/api/socket');

        socket = io({
            path: '/api/socket',
            addTrailingSlash: false
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        return socket;
    };

    return { socket, isConnected };
};

// Helper functions for emitting events
export const emitOrderUpdate = (orderId: string, order: any) => {
    if (socket && socket.connected) {
        socket.emit('order-updated', { orderId, order });
    }
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
