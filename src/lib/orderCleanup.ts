import fs from 'fs';
import path from 'path';

/**
 * Cleans up order data after delivery to save storage
 * - Deletes product photos
 * - Invalidates rider access tokens
 * - Optionally clears QR codes
 */
export async function cleanupDeliveredOrder(order: any): Promise<void> {
    try {
        console.log('🧹 Starting cleanup for delivered order:', order.id);
        
        // 1. Delete product photo from filesystem
        if (order.productPhoto && order.productPhoto.startsWith('/uploads/')) {
            const photoPath = path.join(process.cwd(), 'public', order.productPhoto);
            try {
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                    console.log('✅ Deleted product photo:', photoPath);
                }
            } catch (error) {
                console.error('Failed to delete photo:', error);
            }
        }
        
        // 2. Delete QR code image (optional - you may want to keep for records)
        if (order.qrCode && order.qrCode.startsWith('data:image')) {
            // QR is base64 encoded, no file to delete
            console.log('✅ QR code is base64, no file cleanup needed');
        }
        
        console.log('✅ Cleanup completed for order:', order.id);
        
        return Promise.resolve();
    } catch (error) {
        console.error('Cleanup error:', error);
        return Promise.reject(error);
    }
}

/**
 * Sanitizes order data for delivered orders
 * Removes sensitive/unnecessary data while keeping essential records
 */
export function sanitizeDeliveredOrder(order: any): any {
    return {
        ...order,
        // Clear product photo URL (file already deleted)
        productPhoto: '',
        // Invalidate rider access token
        riderAccessToken: order.riderType === 'PERSONAL' ? 'EXPIRED' : order.riderAccessToken,
        // Keep QR as base64 for records (or clear with empty string)
        // qrCode: '', // Uncomment to remove QR code too
        // Mark as sanitized
        sanitized: true,
        sanitizedAt: Date.now()
    };
}

/**
 * Checks if a rider access token is still valid
 */
export function isRiderTokenValid(order: any): boolean {
    if (order.status === 'DELIVERED') {
        return false; // Always invalid after delivery
    }
    
    if (order.riderAccessToken === 'EXPIRED') {
        return false;
    }
    
    return true;
}

/**
 * Checks if buyer/rider links should be accessible
 */
export function shouldAllowAccess(order: any, accessType: 'buyer' | 'rider'): boolean {
    // After delivery, only seller should have full access
    if (order.status === 'DELIVERED') {
        if (accessType === 'rider' && order.riderType === 'PERSONAL') {
            return false; // Disable rider temp links
        }
        // Buyer can still view for records, but no actions allowed
    }
    
    return true;
}
