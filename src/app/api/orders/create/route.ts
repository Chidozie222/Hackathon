import { NextRequest, NextResponse } from 'next/server';
import { addOrder } from '@/lib/database';
import { generateQRCode, generateUniqueToken } from '@/lib/qrcode';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const {
            sellerId,
            itemName,
            price,
            buyerPhone,
            pickupAddress,
            deliveryAddress,
            productPhoto,
            agreementSummary,
            riderType,
            riderId
        } = await req.json();
        
        // Validation
        if (!sellerId || !itemName || !price || !buyerPhone || !pickupAddress || !deliveryAddress || !agreementSummary || !riderType) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        
        const orderId = uuidv4();
        const buyerLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/${orderId}`;
        
        // Generate QR code - contains order ID for verification
        const qrCode = await generateQRCode(orderId);
        
        // Create order
        const order = {
            id: orderId,
            sellerId,
            itemName,
            price: price.toString(),
            buyerPhone,
            pickupAddress,
            deliveryAddress,
            productPhoto: productPhoto || '',
            agreementSummary,
            riderType,
            ...(riderId && { riderId }),
            ...(riderType === 'PERSONAL' && { riderAccessToken: generateUniqueToken() }),
            qrCode,
            status: 'PENDING_PAYMENT' as const,
            buyerLink,
            createdAt: Date.now()
        };
        
        addOrder(order);
        
        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
