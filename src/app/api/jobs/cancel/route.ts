import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, unassignRiderFromOrder } from '@/lib/database';
import { broadcastNewJob, notifyRiderJobUpdate, broadcastOrderUpdate } from '@/lib/socketBroadcast';

export async function POST(req: NextRequest) {
    try {
        const { orderId, riderId } = await req.json();
        
        if (!orderId || !riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and Rider ID are required' 
            }, { status: 400 });
        }
        
        // 1. Initial Check
        const order = await getOrderById(orderId);
        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        // Only allow cancellation if status is PAID (meaning not yet picked up)
        if (order.status !== 'PAID') {
            return NextResponse.json({ 
                success: false, 
                error: `Cannot cancel job. Current status is ${order.status}` 
            }, { status: 400 });
        }
        
        // Check if this rider actually owns the job
        if (order.riderId !== riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'You are not assigned to this job' 
            }, { status: 403 });
        }
        
        // 2. Unassign Rider
        const updatedOrder = await unassignRiderFromOrder(orderId, riderId);
        
        if (!updatedOrder) {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to cancel job' 
            }, { status: 500 });
        }
        
        console.log(`✅ Job ${orderId} cancelled by rider ${riderId}`);
        
        // 3. Broadcast Updates
        
        // Notify the rider via socket that their job list changed
        // We pass "null" or the order with empty assignments, or just trigger a refresh
        notifyRiderJobUpdate(riderId, updatedOrder);
        
        // Broadcast to ALL riders that a "new" job is available (since it was released)
        broadcastNewJob(updatedOrder);
        
        // Notify seller/tracking
        broadcastOrderUpdate(orderId, updatedOrder);
        
        return NextResponse.json({ 
            success: true,
            message: 'Job cancelled successfully',
            order: updatedOrder
        });
        
    } catch (error: any) {
        console.error('Cancel job error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
