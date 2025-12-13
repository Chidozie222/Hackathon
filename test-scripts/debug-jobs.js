const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/escrow-delivery";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function debugJobs() {
    await connectDB();

    console.log('\n🔍 Inspecting All Orders for Job Compatibility...\n');

    try {
        const allOrders = await Order.find({}).sort({ createdAt: -1 });

        if (allOrders.length === 0) {
            console.log('⚠️ No orders found in the database.');
        } else {
            console.log(`Found ${allOrders.length} total orders.`);
            
            console.log('\n--- Order Details (ID | Status | RiderType | RiderID) ---');
            allOrders.forEach(order => {
                const isPlatform = order.riderType === 'PLATFORM';
                const isPaid = order.status === 'PAID';
                const isUnassigned = !order.riderId;
                
                const shouldBeVisible = isPlatform && isPaid && isUnassigned;
                
                const visibilityIcon = shouldBeVisible ? '✅' : '❌';
                
                console.log(`${visibilityIcon} ${order.id.substring(0, 8)}... | ${order.status.padEnd(15)} | ${order.riderType?.padEnd(10) || 'UNDEFINED '} | ${order.riderId ? 'Assigned' : 'Unassigned'}`);
                
                if (!shouldBeVisible) {
                    const reasons = [];
                    if (!isPlatform) reasons.push(`Type is ${order.riderType} (must be PLATFORM)`);
                    if (!isPaid) reasons.push(`Status is ${order.status} (must be PAID)`);
                    if (!isUnassigned) reasons.push(`Already Assigned to ${order.riderId}`);
                    // console.log(`   Detailed Reason: ${reasons.join(', ')}`);
                }
            });
        }

    } catch (error) {
        console.error('Error querying orders:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected.');
    }
}

debugJobs();
