/**
 * Quick script to insert a test order directly into MongoDB
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function insertTestOrder() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        // Define a flexible schema
        const orderSchema = new mongoose.Schema({
            buyerId: String,
            buyerEmail: String,
            sellerId: String,
            sellerEmail: String,
            riderId: String,
            itemName: String,
            description: String,
            price: Number,
            deliveryAddress: String,
            pickupAddress: String,
            agreementSummary: String,
            status: String,
            paymentReference: String,
            escrowAddress: String,
            riderLocation: {
                latitude: Number,
                longitude: Number,
                accuracy: Number,
                timestamp: Number
            },
            locationHistory: Array,
            createdAt: { type: Date, default: Date.now }
        });

        const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

        const testOrderId = 'test-gps-order-' + Date.now();
        
        const testOrder = {
            id: testOrderId, // Required custom ID field
            buyerId: 'buyer-test-' + Date.now(),
            buyerEmail: 'buyer@test.com',
            buyerPhone: '+234 800 123 4567', // Required
            sellerId: 'seller-test-' + Date.now(),
            sellerEmail: 'seller@test.com',
            riderId: 'rider-test-' + Date.now(),
            itemName: 'Test Package with Live GPS',
            description: 'This is a test order to verify GPS tracking',
            price: '5000', // String as per schema
            deliveryAddress: '15 Victoria Island, Lagos, Nigeria',
            pickupAddress: '25 Ikeja Way, Lagos, Nigeria',
            agreementSummary: 'Product will be delivered with GPS tracking enabled',
            status: 'PICKED_UP',
            riderType: 'PLATFORM', // Required
            qrCode: testOrderId, // Required - using same as ID
            buyerLink: `http://localhost:3000/order/${testOrderId}/track`, // Required
            paymentReference: 'PAY-TEST-' + Date.now(),
            escrowAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            createdAt: Date.now(), // Required
            riderLocation: {
                latitude: 6.4281,  // Lagos, Nigeria
                longitude: 3.4219,
                accuracy: 15,
                timestamp: Date.now()
            },
            locationHistory: [
                {
                    latitude: 6.4281,
                    longitude: 3.4219,
                    timestamp: Date.now()
                }
            ]
        };

        console.log('Creating test order...');
        const order = await Order.create(testOrder);
        
        console.log('\n✅ TEST ORDER CREATED SUCCESSFULLY!\n');
        console.log('=' + '='.repeat(60));
        console.log('📦 Order ID:', order._id.toString());
        console.log('🏷️  Item:', order.itemName);
        console.log('📍 Status:', order.status);
        console.log('🗺️  Rider Location:', order.riderLocation);
        console.log('=' + '='.repeat(60));
        console.log('\n🌐 Open this URL to see the live map:');
        console.log(`   http://localhost:3000/order/${order._id.toString()}/track`);
        console.log('\n💡 The map should show Lagos, Nigeria with the rider marker!\n');

        await mongoose.disconnect();
        console.log('✅ Done');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

insertTestOrder();
