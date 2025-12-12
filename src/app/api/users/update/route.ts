import { NextRequest, NextResponse } from 'next/server';
import { updateUser, getUserById } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const { userId, name, email, phone, brandName, website, walletAddress } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
        }

        // Validate basic fields if necessary
        if (!name || !email) {
            return NextResponse.json({ success: false, error: "Name and Email are required" }, { status: 400 });
        }

        // Update user in database
        await updateUser(userId, {
            name,
            email,
            phone,
            brandName,
            website,
            walletAddress
        });

        // Fetch updated user to return
        const updatedUser = await getUserById(userId);

        if (!updatedUser) {
             return NextResponse.json({ success: false, error: "User not found after update" }, { status: 404 });
        }

        // Remove sensitive data (password)
        const { password, ...safeUser } = updatedUser as any;

        return NextResponse.json({ 
            success: true, 
            message: "Profile updated successfully",
            user: safeUser
        });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Failed to update profile"
        }, { status: 500 });
    }
}
