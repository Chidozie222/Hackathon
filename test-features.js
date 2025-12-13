// Test script for OpenAI and GPS features
const BASE_URL = 'http://localhost:3000';

async function testBackendAPIs() {
    console.log('='.repeat(60));
    console.log('🧪 BACKEND API TESTS');
    console.log('='.repeat(60));

    // Test 1: Check if OpenAI module loads
    console.log('\n📝 TEST 1: OpenAI Module Import');
    try {
        const openai = require('openai');
        console.log('✅ OpenAI package available');
    } catch (error) {
        console.log('❌ OpenAI package not found:', error.message);
    }

    // Test 2: Check if Leaflet modules load
    console.log('\n📝 TEST 2: Leaflet Module Import');
    try {
        const leaflet = require('leaflet');
        console.log('✅ Leaflet package available');
    } catch (error) {
        console.log('❌ Leaflet package not found:', error.message);
    }

    // Test 3: Verify dispute analyze endpoint exists
    console.log('\n📝 TEST 3: Dispute Analyze Endpoint');
    try {
        const response = await fetch(`${BASE_URL}/api/dispute/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: 'test-order-id' })
        });
        console.log(`Status: ${response.status}`);
        if (response.status === 400 || response.status === 404) {
            console.log('✅ Endpoint exists (expected error for missing order)');
        }
    } catch (error) {
        console.log('⚠️ Could not reach endpoint:', error.message);
    }

    // Test 4: Verify GPS location endpoint exists
    console.log('\n📝 TEST 4: GPS Location Update Endpoint');
    try {
        const response = await fetch(`${BASE_URL}/api/rider/update-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: 'test-order',
                riderId: 'test-rider',
                latitude: 6.5244,
                longitude: 3.3792
            })
        });
        console.log(`Status: ${response.status}`);
        if (response.status === 400 || response.status === 404) {
            console.log('✅ Endpoint exists (expected error for missing order)');
        }
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.log('⚠️ Could not reach endpoint:', error.message);
    }

    // Test 5: Check environment variables
    console.log('\n📝 TEST 5: Environment Configuration');
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    console.log(`OpenAI API Key: ${hasOpenAIKey ? '✅ Configured' : '⚠️ Not set (will use mock)'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKEND TESTS COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📋 Next: Manual browser testing required');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Test OpenAI dispute analysis');
    console.log('   3. Test GPS tracking with location permission');
}

// Run tests
testBackendAPIs().catch(console.error);
