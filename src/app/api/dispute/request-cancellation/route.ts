import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const { orderId, reason, buyerId } = await req.json();
        
        if (!orderId || !reason) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and cancellation reason are required' 
            }, { status: 400 });
        }
        
        const order = await getOrderById(orderId);
        
        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        // Check if order can be cancelled
        if (order.status === 'DELIVERED' || order.status === 'DISPUTED') {
            return NextResponse.json({ 
                success: false, 
                error: 'Order cannot be cancelled at this stage' 
            }, { status: 400 });
        }
        
        // Check if already cancelled
        if (order.cancellationRequested) {
            return NextResponse.json({ 
                success: false, 
                error: 'Cancellation already requested' 
            }, { status: 400 });
        }
        
        // Store cancellation request
        await updateOrder(orderId, {
            cancellationRequested: true,
            cancellationReason: reason,
            cancellationRequestedAt: Date.now(),
            status: 'DISPUTED'
        });
        
        console.log('🚫 Cancellation requested for order:', orderId);
        console.log('  Reason:', reason);
        
        return NextResponse.json({ 
            success: true,
            message: 'Cancellation request submitted. AI will analyze your request.'
        });
        
    } catch (error: any) {
        console.error('Request cancellation error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
