
const fetch = require('node-fetch');

async function testSellerOrders() {
    try {
        const sellerId = 'test-seller-id'; // From previous test
        console.log(`Fetching orders for seller: ${sellerId}...`);
        
        const res = await fetch(`http://localhost:3000/api/orders/seller/${sellerId}`);
        const data = await res.json();
        
        console.log('Status:', res.status);
        if (data.success) {
            console.log(`Success! Found ${data.orders.length} orders.`);
            if (data.orders.length > 0) {
                console.log('Sample Order ID:', data.orders[0].id);
            }
        } else {
            console.log('Failed:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testSellerOrders();
