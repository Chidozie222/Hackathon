"use client";
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-600'
    };

    const icons = {
        success: '✅',
        error: '⚠️',
        info: 'ℹ️'
    };

    return (
        <div className={`
            fixed top-4 right-4 z-[9999] 
            ${bgColors[type]} text-white 
            px-6 py-4 rounded-xl shadow-2xl 
            flex items-center gap-3 
            transform transition-all duration-300
            ${isExiting ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'}
            animate-slide-in
        `}>
            <span className="text-xl">{icons[type]}</span>
            <p className="font-bold pr-4">{message}</p>
            <button onClick={handleClose} className="ml-auto opacity-70 hover:opacity-100">✕</button>
        </div>
    );
}
