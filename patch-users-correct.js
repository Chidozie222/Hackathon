
const mongoose = require('mongoose');

// Define schema directly
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String },
    walletAddress: String
}, { collection: 'users', strict: false });

const User = mongoose.model('User', UserSchema);

async function patchUsers() {
    try {
        const DB_URI = 'mongodb://localhost:27017/escrow-delivery';
        console.log(`Connecting to CORRECT database: ${DB_URI}`);
        await mongoose.connect(DB_URI);
        
        console.log('Finding sellers without wallet address...');
        const sellers = await User.find({ 
            type: 'SELLER', 
            $or: [
                { walletAddress: { $exists: false } },
                { walletAddress: '' },
                { walletAddress: null }
            ]
        });
        
        console.log(`Found ${sellers.length} sellers to patch.`);
        
        const mockWallet = '0x1234567890123456789012345678901234567890';
        
        for (const seller of sellers) {
            console.log(`Patching seller: ${seller.id} (${seller.name || 'Unknown Name'})`);
            seller.walletAddress = mockWallet;
            await seller.save();
        }
        
        console.log('✅ Correct Database Patch complete!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

patchUsers();
