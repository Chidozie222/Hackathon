import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const { orderId, riderId } = await req.json();
        
        if (!orderId || !riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and Rider ID are required' 
            }, { status: 400 });
        }
        
        const order = getOrderById(orderId);
        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        // Check if order is available for assignment
        if (order.status !== 'PAID') {
            return NextResponse.json({ 
                success: false, 
                error: `Order cannot be accepted. Current status: ${order.status}` 
            }, { status: 400 });
        }
        
        // Check if already assigned to another rider
        if (order.riderId && order.riderId !== riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'This job has already been accepted by another rider' 
            }, { status: 400 });
        }
        
        // Assign job to rider
        updateOrder(orderId, {
            riderId: riderId,
            acceptedAt: Date.now()
        });
        
        console.log(`✅ Job ${orderId} accepted by rider ${riderId}`);
        
        return NextResponse.json({ 
            success: true,
            message: 'Job accepted successfully',
            order: getOrderById(orderId)
        });
        
    } catch (error: any) {
        console.error('Accept job error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
