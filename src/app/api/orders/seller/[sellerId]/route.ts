import { NextRequest, NextResponse } from 'next/server';
import { getOrdersBySellerId } from '@/lib/database';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ sellerId: string }> }
) {
    try {
        const { sellerId } = await context.params;
        
        if (!sellerId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Seller ID is required' 
            }, { status: 400 });
        }
        
        // Get all orders for this seller
        const sellerOrders = await getOrdersBySellerId(sellerId);
        
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
