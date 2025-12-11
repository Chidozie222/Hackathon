import { NextRequest, NextResponse } from 'next/server';
import { addUser, getUserByEmail } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { type, name, email, phone, brandName, website, vehicleType, licensePlate, nin } = await req.json();
        
        // Validation
        if (!type || !name || !email || !phone) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        
        // Check if user already exists
        const existing = getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
        }
        
        // Create user
        const user = {
            id: uuidv4(),
            type,
            name,
            email,
            phone,
            ...(brandName && { brandName }),
            ...(website && { website }),
            ...(vehicleType && { vehicleType }),
            ...(licensePlate && { licensePlate }),
            ...(nin && { nin }),
            createdAt: Date.now()
        };
        
        addUser(user);
        
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
