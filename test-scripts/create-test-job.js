const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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

async function createTestJob() {
    await connectDB();

    console.log('\n🛠️ Creating Test Job for Rider Dashboard...\n');

    try {
        const orderId = uuidv4();
        const testOrder = {
            id: orderId,
            itemName: "Test Job for Rider Debugging",
            price: "5000",
            status: "PAID", // Critical for visibility
            riderType: "PLATFORM", // Critical for visibility
            pickupAddress: "123 Debug St, Lagos",
            deliveryAddress: "456 Fix Ave, Lagos",
            sellerId: "test-seller-id",
            buyerPhone: "+2348000000000",
            agreementSummary: "Debug test item",
            createdAt: Date.now()
        };

        await Order.create(testOrder);
        console.log(`✅ Created Order: ${orderId}`);
        console.log(`\nNOTE: This order SHOULD appear in the Rider Dashboard 'Available Jobs' list immediately.`);

    } catch (error) {
        console.error('Error creating order:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestJob();
