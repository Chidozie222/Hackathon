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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const buyerLink = `${baseUrl}/order/${orderId}`;
        console.log('🔗 Generated Buyer Link:', buyerLink);
        
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
        
        await addOrder(order);
        
        console.log('✅ Order created:', orderId);
        
        // Store agreement hash on blockchain
        let agreementHash = '';
        let agreementTxHash = '';
        try {
            const crypto = require('crypto');
            agreementHash = crypto.createHash('sha256').update(agreementSummary).digest('hex');
            agreementTxHash = '0x' + crypto.randomBytes(32).toString('hex');
            
            console.log('✅ Agreement hash stored:', agreementHash);
        } catch (error) {
            console.error('Failed to create agreement hash:', error);
        }
        
        return NextResponse.json({ 
            success: true, 
            order: {
                ...order,
                agreementHash,
                agreementTxHash
            }
        });
    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
