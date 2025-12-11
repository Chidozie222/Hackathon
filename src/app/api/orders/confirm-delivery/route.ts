import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';
import { approveCustodialEscrow } from '@/lib/serverWallet';
import { cleanupDeliveredOrder, sanitizeDeliveredOrder } from '@/lib/orderCleanup';
import { broadcastOrderUpdate } from '@/lib/socketBroadcast';

export async function POST(req: NextRequest) {
    try {
        const { orderId, scannedData } = await req.json();

        if (!orderId || !scannedData) {
            return NextResponse.json({ success: false, error: "Missing orderId or scannedData" }, { status: 400 });
        }

        // Get order details
        const order = getOrderById(orderId);
        
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Verify the scanned data matches the order ID
        // The QR code should contain the order ID
        if (scannedData !== orderId) {
            return NextResponse.json({ 
                success: false, 
                error: "QR code does not match this order" 
            }, { status: 400 });
        }

        // Check order status - must be IN_TRANSIT to confirm delivery
        if (order.status !== 'IN_TRANSIT' && order.status !== 'PICKED_UP') {
            return NextResponse.json({ 
                success: false, 
                error: `Cannot confirm delivery. Order status is ${order.status}` 
            }, { status: 400 });
        }

        // Update order status to DELIVERED
        updateOrder(orderId, {
            status: 'DELIVERED',
            deliveryTime: Date.now()
        });

        // Get updated order
        const updatedOrder = getOrderById(orderId);

        // Broadcast real-time update to all clients watching this order
        if (updatedOrder) {
            broadcastOrderUpdate(orderId, updatedOrder);
        }

        // Cleanup: Delete photos and invalidate tokens
        try {
            await cleanupDeliveredOrder(order);
            
            // Sanitize order data
            const sanitizedData = sanitizeDeliveredOrder(order);
            updateOrder(orderId, sanitizedData);
            
            console.log('🧹 Order data cleaned up and sanitized');
        } catch (cleanupError) {
            console.error('Cleanup warning:', cleanupError);
            // Continue even if cleanup fails
        }

        // Release funds from escrow
        if (order.escrowAddress) {
            try {
                const txHash = await approveCustodialEscrow(order.escrowAddress);
                console.log(`✅ Delivery confirmed for order ${orderId}`);
                console.log(`💰 Escrow funds released. Transaction: ${txHash}`);
                
                return NextResponse.json({ 
                    success: true, 
                    message: "Delivery confirmed, funds released, and data cleaned up!",
                    txHash 
                });
            } catch (escrowError: any) {
                console.error("Escrow release error:", escrowError);
                // Still mark as delivered even if blockchain fails
                return NextResponse.json({ 
                    success: true, 
                    message: "Delivery confirmed and data cleaned up, but escrow release failed",
                    warning: escrowError.message 
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Delivery confirmed and data cleaned up!" 
        });

    } catch (error: any) {
        console.error("Delivery confirmation error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
