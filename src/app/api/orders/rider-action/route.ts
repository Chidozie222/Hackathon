import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';
import { broadcastOrderUpdate } from '@/lib/socketBroadcast';

export async function POST(req: NextRequest) {
    try {
        const { orderId, scannedData, action } = await req.json();

        if (!orderId || !scannedData || !action) {
            return NextResponse.json({ 
                success: false, 
                error: "Missing orderId, scannedData, or action" 
            }, { status: 400 });
        }

        // Get order details
        const order = getOrderById(orderId);
        
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Verify the scanned data matches the order ID
        if (scannedData !== orderId) {
            return NextResponse.json({ 
                success: false, 
                error: "QR code does not match this order" 
            }, { status: 400 });
        }

        // Handle different actions
        if (action === 'pickup') {
            // Check order status - must be PAID to confirm pickup
            if (order.status !== 'PAID') {
                return NextResponse.json({ 
                    success: false, 
                    error: `Cannot confirm pickup. Order status is ${order.status}. Must be PAID.` 
                }, { status: 400 });
            }

            // Update order status directly to IN_TRANSIT (rider has package and is delivering)
            updateOrder(orderId, {
                status: 'IN_TRANSIT',
                pickupTime: Date.now()
            });

            // Broadcast real-time update
            const updatedOrder = getOrderById(orderId);
            if (updatedOrder) {
                broadcastOrderUpdate(orderId, updatedOrder);
            }

            console.log(`✅ Pickup confirmed for order ${orderId} - now IN_TRANSIT`);
            
            return NextResponse.json({ 
                success: true, 
                message: "Pickup confirmed! Package is now in transit to the buyer." 
            });

        } else {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid action. Must be 'pickup'" 
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Rider action error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
