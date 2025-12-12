import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/paystack';
import { createCustodialEscrow } from '@/lib/serverWallet';
import { addManagedEscrow } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    try {
        // MOCK PAYMENT - Always succeed if reference starts with mock_ref_
        if (reference.startsWith('mock_ref_')) {
            // Extract orderId from URL if present
            const orderId = searchParams.get('orderId');
            
            if (orderId) {
                // Get order details
                const { getOrderById, getUserById } = await import('@/lib/database');
                const order = await getOrderById(orderId);
                
                if (!order) {
                    return NextResponse.redirect(new URL('/?payment=failed&reason=order_not_found', req.url));
                }

                const seller = await getUserById(order.sellerId);
                if (!seller?.walletAddress) {
                    throw new Error("Seller wallet address not found");
                }
                
                // Convert NGN to ETH equivalent for blockchain
                // Using a simple conversion: 1 ETH = 1,000,000 NGN (mock rate)
                const amountInNGN = parseFloat(order.price);
                const amountInETH = (amountInNGN / 1000000).toFixed(4);
                
                // Create blockchain escrow with the converted amount
                const { createCustodialEscrow } = await import('@/lib/serverWallet');
                const { hash: txHash, escrowAddress } = await createCustodialEscrow(
                    seller.walletAddress, // use actual wallet address
                    amountInETH    // amount in ETH
                );
                
                // Update order status to PAID and save blockchain details
                const { updateOrder } = await import('@/lib/database');
                await updateOrder(orderId, {
                    status: 'PAID',
                    paymentReference: reference,
                    escrowAddress: escrowAddress || undefined
                });
                
                // Broadcast new job to riders if it's a platform job
                if (order.riderType === 'PLATFORM') {
                    const { broadcastNewJob } = await import('@/lib/socketBroadcast');
                    // We need to pass the updated order object (or at least the fields the rider dashboard needs)
                    // Since updateOrder doesn't return the object, let's construct it or re-fetch active fields.
                    // simpler: construct the job object manually with new status
                    broadcastNewJob({
                        ...order,
                        status: 'PAID',
                        paymentReference: reference,
                        escrowAddress: escrowAddress || undefined
                    });
                }
                
                console.log(`✅ Payment verified for order ${orderId}`);
                console.log(`💰 Amount: ₦${amountInNGN} → ${amountInETH} ETH`);
                console.log(`⛓️ Blockchain escrow created at: ${escrowAddress}`);
                console.log(`📝 Transaction hash: ${txHash}`);
                
                // Redirect to tracking page
                return NextResponse.redirect(new URL(`/order/${orderId}/track`, req.url));
            }
        }
        
        // If not a mock payment or no orderId, redirect to error
        return NextResponse.redirect(new URL('/?payment=failed&reason=invalid_reference', req.url));

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        return NextResponse.redirect(new URL('/?payment=error&reason=' + encodeURIComponent(error.message), req.url));
    }
}
