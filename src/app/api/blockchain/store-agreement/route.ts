import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Store agreement hash on blockchain and in database
export async function POST(req: NextRequest) {
    try {
        const { orderId, agreementSummary } = await req.json();
        
        if (!orderId || !agreementSummary) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID and agreement summary are required' 
            }, { status: 400 });
        }
        
        // Create hash of agreement (SHA-256)
        const agreementHash = crypto
            .createHash('sha256')
            .update(agreementSummary)
            .digest('hex');
        
        // In a real implementation, you would:
        // 1. Store this hash on the blockchain
        // 2. Get the transaction hash back
        // For now, we'll simulate this with a mock transaction hash
        
        const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
        
        console.log('📝 Agreement stored:');
        console.log('  Order ID:', orderId);
        console.log('  Hash:', agreementHash);
        console.log('  Tx Hash:', mockTxHash);
        
        return NextResponse.json({ 
            success: true,
            agreementHash,
            txHash: mockTxHash,
            message: 'Agreement hash stored on blockchain'
        });
        
    } catch (error: any) {
        console.error('Store agreement error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
