import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '../../../../lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const { amount, sellerEmail } = await req.json();
    
    // Validate inputs
    if (!amount || !sellerEmail) {
        return NextResponse.json({ success: false, error: "Missing amount or seller email" }, { status: 400 });
    }

    const response = await initializePayment(sellerEmail, amount);
    
    if (response.status && response.data) {
         return NextResponse.json({ 
             success: true, 
             authorization_url: response.data.authorization_url,
             reference: response.data.reference 
         });
    } else {
        return NextResponse.json({ success: false, error: response.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
