/**
 * Create a test order with GPS data via API call
 * Run this with: node create-simple-test-order.js
 */

async function createTestOrder() {
    const orderData = {
        buyerId: 'test-buyer-123',
        buyerEmail: 'buyer@test.com',
        sellerId: 'test-seller-123',
        sellerEmail: 'seller@test.com',
        riderId: 'test-rider-123',
        itemName: 'Test Package with GPS Tracking',
        description: 'Test order for GPS demonstration',
        price: 5000,
        deliveryAddress: 'Victoria Island, Lagos, Nigeria',
        pickupAddress: 'Ikeja, Lagos, Nigeria',
        agreementSummary: 'Test product delivered with GPS tracking',
        status: 'PICKED_UP',
        paymentReference: 'test-ref-' + Date.now(),
        escrowAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        riderLocation: {
            latitude: 6.4541, // Lagos, Nigeria coordinates
            longitude: 3.3947,
            accuracy: 10,
            timestamp: Date.now()
        },
        locationHistory: [
            {
                latitude: 6.4541,
                longitude: 3.3947,
                timestamp: Date.now()
            }
        ]
    };

    try {
        console.log('Creating test order via MongoDB...');
        
        // Use direct MongoDB connection
        const mongoose = require('mongoose');
        require('dotenv').config();
        
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Simple schema-less model
        const OrderModel = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        
        const order = await OrderModel.create(orderData);
        
        console.log('\n✅ Test order created successfully!');
        console.log('📍 Order ID:', order._id.toString());
        console.log('📍 Status:', order.status);
        console.log('📍 Rider Location:', order.riderLocation);
        console.log('\n🔗 Open this URL in your browser:');
        console.log(`   http://localhost:3000/order/${order._id.toString()}/track`);
        console.log('\n💡 The map should show the rider location in Lagos, Nigeria');

        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

create TestOrder();
