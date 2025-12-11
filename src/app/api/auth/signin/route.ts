import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        
        if (!email || !password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email and password are required' 
            }, { status: 400 });
        }
        
        // Find user by email
        const user = getUserByEmail(email);
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }
        
        // Validate password
        if (user.password !== password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        // Return user data (auto-detects type from user.type field)
        return NextResponse.json({ 
            success: true, 
            user: userWithoutPassword,
            message: `Signed in as ${user.type.toLowerCase()}`
        });
        
    } catch (error: any) {
        console.error('Sign in error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
