import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';
import { setIO } from '@/lib/socketBroadcast';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log('🔌 Initializing Socket.io server...');

        const httpServer: NetServer = res.socket.server as any;
        const io = new SocketIOServer(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        res.socket.server.io = io;
        setIO(io); // Enable global broadcast

        io.on('connection', (socket) => {
            console.log('✅ Client connected:', socket.id);

            // Join order-specific room
            socket.on('join-order', (orderId: string) => {
                socket.join(`order-${orderId}`);
                console.log(`📦 Socket ${socket.id} joined order-${orderId}`);
            });

            // Leave order room
            socket.on('leave-order', (orderId: string) => {
                socket.leave(`order-${orderId}`);
                console.log(`👋 Socket ${socket.id} left order-${orderId}`);
            });

            // Join rider dashboard room
            socket.on('join-rider-dashboard', (riderId: string) => {
                socket.join(`rider-${riderId}`);
                console.log(`🏍️ Rider ${riderId} joined dashboard`);
            });

            // Join seller dashboard room
            socket.on('join-seller-dashboard', (sellerId: string) => {
                socket.join(`seller-${sellerId}`);
                console.log(`🏪 Seller ${sellerId} joined dashboard`);
            });

            // Rider location updates
            socket.on('rider-location', (data: { orderId: string; lat: number; lng: number }) => {
                io.to(`order-${data.orderId}`).emit('rider-location-update', data);
                console.log(`📍 Rider location updated for order ${data.orderId}`);
            });

            socket.on('disconnect', () => {
                console.log('❌ Client disconnected:', socket.id);
            });
        });

        console.log('✅ Socket.io server initialized');
    } else {
        console.log('♻️ Socket.io server already running');
        // Ensure global broadcast instance is set even if server is already running
        // This fixes the issue where module reloads in dev mode clear the global reference
        setIO(res.socket.server.io); 
    }

    res.end();
};

export default ioHandler;

