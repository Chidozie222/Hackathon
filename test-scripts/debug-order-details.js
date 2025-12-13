/**
 * Debug script to check a specific order's data
 * Usage: node debug-order-details.js [orderId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function debugOrder() {
    try {
        const orderId = process.argv[2];
        if (!orderId) {
            console.log('Usage: node debug-order-details.js [orderId]');
            console.log('Example: node debug-order-details.js 67123abc45def67890');
            process.exit(1);
        }

        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        
        let order;
        // Try both formats
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            order = await Order.findById(orderId);
        }
        
        if (!order) {
            order = await Order.findOne({ id: orderId });
        }

        if (!order) {
            console.log('❌ Order not found:', orderId);
            console.log('\nTrying to list all orders...\n');
            const allOrders = await Order.find({}).limit(10);
            console.log(`Found ${allOrders.length} orders:`);
            allOrders.forEach(o => {
                console.log(`  - ID: ${o._id} | Status: ${o.status} | Item: ${o.itemName}`);
            });
        } else {
            console.log('📦 ORDER DETAILS:\n');
            console.log(JSON.stringify(order.toObject(), null, 2));
            console.log('\n📍 GPS DATA:');
            console.log('  - riderLocation:', order.riderLocation || 'NOT SET');
            console.log('  - locationHistory:', order.locationHistory ? `${order.locationHistory.length} points` : 'NOT SET');
            console.log('\n🏍️ RIDER INFO:');
            console.log('  - riderId:', order.riderId || 'NOT SET');
            console.log('  - Status:', order.status);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

debugOrder();
