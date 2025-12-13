import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const { orderId, riderId, latitude, longitude, accuracy } = await req.json();

        // Validation
        if (!orderId || !riderId || latitude === undefined || longitude === undefined) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return NextResponse.json({
                success: false,
                error: 'Invalid coordinates'
            }, { status: 400 });
        }

        // Get order
        const order = await getOrderById(orderId);
        if (!order) {
            return NextResponse.json({
                success: false,
                error: 'Order not found'
            }, { status: 404 });
        }

        // Verify rider
        if (order.riderId !== riderId) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 403 });
        }

        // Only track if order is in active delivery status
        const trackableStatuses = ['PICKED_UP', 'IN_TRANSIT'];
        if (!trackableStatuses.includes(order.status)) {
            return NextResponse.json({
                success: false,
                error: 'Order is not in trackable status'
            }, { status: 400 });
        }

        const timestamp = Date.now();

        // Update rider location and add to history
        const locationHistory = order.locationHistory || [];
        
        // Keep only last 50 locations to prevent database bloat
        if (locationHistory.length >= 50) {
            locationHistory.shift();
        }
        
        locationHistory.push({
            latitude,
            longitude,
            timestamp
        });

        await updateOrder(orderId, {
            riderLocation: {
                latitude,
                longitude,
                accuracy: accuracy || 0,
                timestamp
            },
            locationHistory
        });

        // Broadcast location update via Socket.io
        const { broadcastLocationUpdate } = await import('@/lib/socketBroadcast');
        broadcastLocationUpdate(orderId, {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp
        });

        console.log(`📍 Location updated for order ${orderId}: (${latitude}, ${longitude})`);

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully'
        });

    } catch (error: any) {
        console.error('Location update error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
