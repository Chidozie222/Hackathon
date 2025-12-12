import { NextRequest, NextResponse } from 'next/server';
import { addUser, getUserByEmail } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { type, name, email, phone, password, brandName, website, vehicleType, licensePlate, nin, walletAddress } = await req.json();
        
        // Validation
        if (!type || !name || !email || !phone || !password) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        
        // Check if user already exists
        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = {
            id: uuidv4(),
            type,
            name,
            email,
            phone,
            password: hashedPassword,
            ...(brandName && { brandName }),
            ...(website && { website }),
            ...(vehicleType && { vehicleType }),
            ...(licensePlate && { licensePlate }),
            ...(nin && { nin }),
            ...(nin && { nin }),
            // Auto-generate crypto wallet if not provided (mock address for now)
            walletAddress: walletAddress || `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            createdAt: Date.now()
        };
        
        await addUser(user);
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
