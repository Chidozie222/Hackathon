/**
 * Creates a test order with PICKED_UP status and GPS location data
 * for testing the LiveMap component
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

async function createTestOrderWithGPS() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create test order with GPS location
        const testOrder = {
            buyerId: 'test-buyer-123',
            buyerEmail: 'buyer@test.com',
            sellerId: 'test-seller-123',
            sellerEmail: 'seller@test.com',
            riderId: 'test-rider-123',
            itemName: 'Test Package with GPS',
            description: 'Test order for GPS tracking demonstration',
            price: 5000,
            deliveryAddress: 'Test Address, Lagos, Nigeria',
            pickupAddress: 'Test Pickup, Lagos, Nigeria',
            agreementSummary: 'Test product delivered with GPS tracking',
            status: 'PICKED_UP',
            paymentReference: 'test-ref-' + Date.now(),
            escrowAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            riderLocation: {
                latitude: 6.5244, // Lagos coordinates
                longitude: 3.3792,
                accuracy: 10,
                timestamp: Date.now()
            },
            locationHistory: [
                {
                    latitude: 6.5244,
                    longitude: 3.3792,
                    timestamp: Date.now() - 60000
                },
                {
                    latitude: 6.5254,
                    longitude: 3.3802,
                    timestamp: Date.now() - 30000
                },
                {
                    latitude: 6.5264,
                    longitude: 3.3812,
                    timestamp: Date.now()
                }
            ]
        };

        const order = await Order.create(testOrder);
        console.log('✅ Test order created successfully!');
        console.log('📍 Order ID:', order._id.toString());
        console.log('📍 Order ID (use this):', order.id || order._id);
        console.log('📍 Status:', order.status);
        console.log('📍 Rider Location:', order.riderLocation);
        console.log('\n🔗 Open in browser:');
        console.log(`   http://localhost:3000/order/${order.id || order._id}/track`);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestOrderWithGPS();
