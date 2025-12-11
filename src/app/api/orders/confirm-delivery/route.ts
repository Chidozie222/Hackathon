import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';
import { approveCustodialEscrow } from '@/lib/serverWallet';

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

        // Release funds from escrow
        if (order.escrowAddress) {
            try {
                const txHash = await approveCustodialEscrow(order.escrowAddress);
                console.log(`✅ Delivery confirmed for order ${orderId}`);
                console.log(`💰 Escrow funds released. Transaction: ${txHash}`);
                
                return NextResponse.json({ 
                    success: true, 
                    message: "Delivery confirmed and funds released!",
                    txHash 
                });
            } catch (escrowError: any) {
                console.error("Escrow release error:", escrowError);
                // Still mark as delivered even if blockchain fails
                return NextResponse.json({ 
                    success: true, 
                    message: "Delivery confirmed but escrow release failed",
                    warning: escrowError.message 
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Delivery confirmed!" 
        });

    } catch (error: any) {
        console.error("Delivery confirmation error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
