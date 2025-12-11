import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/database';

export async function GET(
    req: NextRequest,
    { params }: { params: { sellerId: string } }
) {
    try {
        const sellerId = params.sellerId;
        
        if (!sellerId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Seller ID is required' 
            }, { status: 400 });
        }
        
        // Get all orders for this seller
        const allOrders = getAllOrders();
        const sellerOrders = allOrders.filter(order => order.sellerId === sellerId);
        
        return NextResponse.json({ 
            success: true,
            orders: sellerOrders
        });
        
    } catch (error: any) {
        console.error('Get seller orders error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
