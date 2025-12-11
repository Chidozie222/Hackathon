import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { amount, sellerEmail, orderId } = await req.json();    
    // Validation
    if (!amount || !sellerEmail) {
        return NextResponse.json({ success: false, error: "Missing amount or seller email" }, { status: 400 });
    }

    // MOCK PAYMENT - Generate fake reference and redirect URL
    const reference = `mock_ref_${uuidv4()}`;
    const mockCheckoutUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/mock-checkout?amount=${amount}&reference=${reference}&orderId=${orderId || ''}`;
    
    return NextResponse.json({ 
        success: true, 
        authorization_url: mockCheckoutUrl,
        reference: reference 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
