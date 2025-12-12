// Socket.io broadcaster for Next.js App Router
// Since App Router doesn't have direct access to res.socket.server.io,
// we'll use a global instance

import { Server as SocketIOServer } from 'socket.io';

// Use globalThis to persist io instance across module reloads in dev
declare global {
    var ioInstance: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | null {
    return globalThis.ioInstance || null;
}

export function setIO(io: SocketIOServer) {
    globalThis.ioInstance = io;
}

/**
 * Broadcasts order update to all connected clients watching this order
 */
export function broadcastOrderUpdate(orderId: string, order: any) {
    try {
        const io = getIO();
        if (io) {
            io.to(`order-${orderId}`).emit('order-updated', order);
            console.log(`📡 Broadcast: order-${orderId} updated`);
        } else {
            console.warn('⚠️ Socket.io not initialized');
        }
    } catch (error) {
        console.error('Broadcast error:', error);
    }
}

/**
 * Broadcasts new job to all riders
 */
export function broadcastNewJob(job: any) {
    try {
        const io = getIO();
        if (io) {
            io.emit('new-job', job);
            console.log(`📡 Broadcast: new job available`);
        }
    } catch (error) {
        console.error('Broadcast error:', error);
    }
}

/**
 * Notifies specific seller of order updates
 */
export function notifySellerOrderUpdate(sellerId: string, order: any) {
    try {
        const io = getIO();
        if (io) {
            io.to(`seller-${sellerId}`).emit('seller-order-update', order);
            console.log(`📡 Notified seller-${sellerId}`);
        }
    } catch (error) {
        console.error('Notify error:', error);
    }
}

/**
 * Notifies specific rider of job update
 */
export function notifyRiderJobUpdate(riderId: string, job: any) {
    try {
        const io = getIO();
        if (io) {
            io.to(`rider-${riderId}`).emit('rider-job-update', job);
            console.log(`📡 Notified rider-${riderId}`);
        }
    } catch (error) {
        console.error('Notify error:', error);
    }
}

/**
 * Broadcasts when a job is taken (removed from available list)
 */
export function broadcastJobTaken(jobId: string) {
    try {
        const io = getIO();
        if (io) {
            io.emit('job-taken', { id: jobId });
            console.log(`📡 Broadcast: job-${jobId} taken`);
        }
    } catch (error) {
        console.error('Broadcast error:', error);
    }
}
