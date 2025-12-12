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
        
        // Store dispute on blockchain if escrow exists
        let disputeTxHash: string | undefined;
        if (order.escrowAddress) {
            try {
                const { raiseDisputeOnChain } = await import('@/lib/serverWallet');
                console.log('📝 Storing dispute on blockchain...');
                disputeTxHash = await raiseDisputeOnChain(order.escrowAddress, reason);
                console.log('✅ Dispute stored on blockchain:', disputeTxHash);
            } catch (blockchainError: any) {
                console.error('⚠️ Blockchain storage failed, continuing with MongoDB only:', blockchainError.message);
                // Continue with MongoDB storage even if blockchain fails
            }
        }
        
        // Store cancellation request in database
        await updateOrder(orderId, {
            cancellationRequested: true,
            cancellationReason: reason,
            cancellationRequestedAt: Date.now(),
            status: 'DISPUTED',
            disputeTxHash
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
