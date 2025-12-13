
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true },
    sellerId: { type: String, required: true },
    status: String
}, { collection: 'orders', strict: false });

const Order = mongoose.model('Order', OrderSchema);

async function listOrders() {
    try {
        // Try to match the app's default logic if env var calls for it
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon_db';
        console.log(`Connecting to: ${MONGODB_URI}`);
        
        await mongoose.connect(MONGODB_URI);
        
        const count = await Order.countDocuments();
        console.log(`Total Orders in DB: ${count}`);
        
        const orders = await Order.find().limit(5);
        if (orders.length > 0) {
            console.log('Sample Orders:', JSON.stringify(orders, null, 2));
        } else {
            console.log('No orders found in this DB.');
        }
        
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

listOrders();
