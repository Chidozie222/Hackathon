import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, assignRiderToOrder, getActiveJobsByRiderId } from '@/lib/database';
import { broadcastJobTaken, notifyRiderJobUpdate, broadcastOrderUpdate } from '@/lib/socketBroadcast';

export async function POST(req: NextRequest) {
    try {
        const { orderId, riderId } = await req.json();
        
        if (!orderId || !riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and Rider ID are required' 
            }, { status: 400 });
        }
        
        // 1. Check if rider already has an active job
        const activeJobs = await getActiveJobsByRiderId(riderId);
        if (activeJobs.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: `You already have an active job (${activeJobs[0].itemName}). Please complete it first.` 
            }, { status: 400 });
        }

        // 2. Initial Check (Read-only) to provide specific error messages
        const order = await getOrderById(orderId);
        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        if (order.status !== 'PAID') {
            return NextResponse.json({ 
                success: false, 
                error: `Order cannot be accepted. Current status: ${order.status}` 
            }, { status: 400 });
        }
        
        if (order.riderId) {
            return NextResponse.json({ 
                success: false, 
                error: order.riderId === riderId 
                    ? 'You have already accepted this job' 
                    : 'This job has already been accepted by another rider'
            }, { status: 400 });
        }
        
        // 3. Atomic Assignment
        // Even if the check above passed, a race condition could occur here.
        // assignRiderToOrder ensures only one request succeeds.
        const updatedOrder = await assignRiderToOrder(orderId, riderId);

        if (!updatedOrder) {
            // If we are here, it means the order exists (checked above), but the atomic update failed.
            // This implies someone else claimed it in the split second between the check and the update.
            return NextResponse.json({ 
                success: false, 
                error: 'Job was just taken by another rider' 
            }, { status: 409 }); // 409 Conflict
        }
        
        // ... (inside POST function, after successful atomic update)

        console.log(`✅ Job ${orderId} accepted by rider ${riderId}`);
        
        // Broadcast updates
        broadcastJobTaken(orderId);
        notifyRiderJobUpdate(riderId, updatedOrder);
        
        // Notify seller specifically (for dashboard toast)
        const { notifySellerOrderUpdate } = await import('@/lib/socketBroadcast'); 
        notifySellerOrderUpdate(updatedOrder.sellerId, updatedOrder);
        
        broadcastOrderUpdate(orderId, updatedOrder); // Notify seller tracking page
        
        return NextResponse.json({ 
            success: true,
            message: 'Job accepted successfully',
            order: updatedOrder
        });
        
    } catch (error: any) {
        console.error('Accept job error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
