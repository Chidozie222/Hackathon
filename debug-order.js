
const mongoose = require('mongoose');

// Define schemas locally to avoid import issues
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String },
    walletAddress: String
}, { collection: 'users', strict: false });

const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true },
    sellerId: { type: String, required: true },
    status: String
}, { collection: 'orders', strict: false });

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

async function debugOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon_db');
        
        const orderId = '27ac2897-d139-4c55-8394-4d23dd4d3c37';
        console.log(`Searching for Order: ${orderId}`);
        
        const order = await Order.findOne({ id: orderId });
        if (!order) {
            console.log('❌ Order NOT FOUND in DB');
            return;
        }
        console.log('✅ Order Found:', JSON.stringify(order, null, 2));
        
        const sellerId = order.sellerId;
        console.log(`Searching for Seller: ${sellerId}`);
        
        const seller = await User.findOne({ id: sellerId });
        if (!seller) {
            console.log('❌ Seller NOT FOUND in DB');
            return;
        }
        
        console.log('✅ Seller Found:', JSON.stringify(seller, null, 2));
        
        if (!seller.walletAddress) {
            console.log('❌ ISSUE CONFIRMED: Seller has NO walletAddress');
            
            // Auto-fix attempt
            console.log('🛠️ Attempting to patch seller...');
            seller.walletAddress = '0x1234567890123456789012345678901234567890';
            await seller.save();
            console.log('✅ Seller patched with mock wallet address');
        } else {
            console.log('✅ Seller HAS walletAddress:', seller.walletAddress);
        }
        
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

debugOrder();
