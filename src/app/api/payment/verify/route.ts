import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '../../../../lib/paystack';
import { createCustodialEscrow } from '../../../../lib/serverWallet';
import { addManagedEscrow } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    try {
        const response = await verifyPayment(reference);
        
        if (response.status && response.data && response.data.status === 'success') {
            // Payment successful!
            const metadata = response.data.metadata as any;
            const ethAmount = metadata?.custom_fields?.find((f: any) => f.variable_name === 'eth_amount')?.value || "0.0";
            const sellerEmail = response.data.customer?.email || 'unknown@seller.com';

            // Trigger On-Chain Escrow Creation
            const { hash: txHash, escrowAddress } = await createCustodialEscrow(sellerEmail, ethAmount);

            // Save to DB
            const newEscrow = {
                id: uuidv4(),
                buyerEmail: 'current_user@demo.com', // In real app, get from session
                sellerEmail,
                amount: ethAmount,
                status: 'PENDING' as const,
                txHash,
                escrowAddress: escrowAddress || undefined,
                createdAt: Date.now(),
                paymentReference: reference
            };
            addManagedEscrow(newEscrow);

            // Redirect back to home with success
            return NextResponse.redirect(new URL('/?payment=success&escrowId=' + newEscrow.id, req.url));
        } else {
             return NextResponse.redirect(new URL('/?payment=failed&reason=verification_failed', req.url));
        }

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        return NextResponse.redirect(new URL('/?payment=error&reason=' + encodeURIComponent(error.message), req.url));
    }
}
