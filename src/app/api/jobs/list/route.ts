import { NextRequest, NextResponse } from 'next/server';
import { getAvailableJobs, getActiveJobsByRiderId, getCompletedJobsByRiderId } from '@/lib/database';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const riderId = searchParams.get('riderId');
        
        if (!riderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Rider ID is required' 
            }, { status: 400 });
        }
        
        // Fetch jobs using optimized database queries
        const availableJobs = await getAvailableJobs();
        const activeJobs = await getActiveJobsByRiderId(riderId);
        const completedJobs = await getCompletedJobsByRiderId(riderId);
        
        return NextResponse.json({ 
            success: true,
            availableJobs,
            activeJobs,
            completedJobs,
            stats: {
                available: availableJobs.length,
                active: activeJobs.length,
                completed: completedJobs.length
            }
        });
        
    } catch (error: any) {
        console.error('Get jobs error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
