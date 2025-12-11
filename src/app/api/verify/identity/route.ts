import { NextRequest, NextResponse } from 'next/server';

// Mock verification for testing (when API keys not available)
async function mockVerifyIdentity(ninOrBvn: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation
    if (!/^\d{11}$/.test(ninOrBvn)) {
        return {
            success: false,
            error: 'Invalid format. NIN/BVN must be 11 digits.'
        };
    }
    
    // Mock success for testing
    return {
        success: true,
        data: {
            nin: ninOrBvn,
            firstname: name.split(' ')[0],
            lastname: name.split(' ').slice(1).join(' '),
            verified: true
        }
    };
}

// Real Flutterwave BVN verification
async function verifyBVNFlutterwave(bvn: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    
    if (!secretKey) {
        return {
            success: false,
            error: 'API key not configured. Using mock mode.'
        };
    }
    
    try {
        const response = await fetch(`https://api.flutterwave.com/v3/kyc/bvns/${bvn}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            return {
                success: true,
                data: result.data
            };
        } else {
            return {
                success: false,
                error: result.message || 'Verification failed'
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error during verification'
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const { ninOrBvn, name, type } = await req.json();
        
        if (!ninOrBvn || !name) {
            return NextResponse.json({ 
                success: false, 
                error: 'NIN/BVN and name are required' 
            }, { status: 400 });
        }
        
        // Check if we should use mock verification
        const useMock = process.env.USE_MOCK_VERIFICATION === 'true' || !process.env.FLUTTERWAVE_SECRET_KEY;
        
        let result;
        if (useMock) {
            console.log('Using mock verification (set USE_MOCK_VERIFICATION=false and add FLUTTERWAVE_SECRET_KEY for real verification)');
            result = await mockVerifyIdentity(ninOrBvn, name);
        } else {
            // For now, we'll use BVN verification
            // NIN verification endpoint may differ or require different service
            result = await verifyBVNFlutterwave(ninOrBvn);
        }
        
        if (result.success) {
            return NextResponse.json({
                success: true,
                verified: true,
                message: 'Identity verified successfully',
                data: result.data
            });
        } else {
            return NextResponse.json({
                success: false,
                verified: false,
                error: result.error
            }, { status: 400 });
        }
        
    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({
            success: false,
            error: 'Verification failed: ' + error.message
        }, { status: 500 });
    }
}
