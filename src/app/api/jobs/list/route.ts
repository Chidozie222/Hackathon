import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/database';

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
        
        const allOrders = getAllOrders();
        
        // Available jobs: PAID orders not yet assigned
        const availableJobs = allOrders.filter(order => 
            order.status === 'PAID' && !order.riderId
        );
        
        // Active jobs: Jobs assigned to this rider that are not delivered
        const activeJobs = allOrders.filter(order => 
            order.riderId === riderId && 
            (order.status === 'PAID' || order.status === 'IN_TRANSIT')
        );
        
        // Completed jobs: Jobs this rider delivered
        const completedJobs = allOrders.filter(order => 
            order.riderId === riderId && 
            order.status === 'DELIVERED'
        );
        
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
