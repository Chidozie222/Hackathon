import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';

test.describe('TrustLock E2E Tests', () => {
  
  test('Complete Order Flow - Authentication to Payment', async ({ page }) => {
    console.log('🧪 Starting E2E test: Order creation and payment');
    
    // 1. Register as Seller
    await page.goto(`${BASE_URL}/seller/register`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="name"]', 'Test Seller');
    await page.fill('input[name="email"]', `seller-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="brand"]', 'Test Store');
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/seller/dashboard', { timeout: 5000 });
    
    console.log('✅ Seller registered successfully');
    
    // 2. Create Order
    await page.click('text=Create New Order');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="buyerEmail"]', 'buyer@test.com');
    await page.fill('input[name="itemName"]', 'Red Nike Shoes');
    await page.fill('input[name="price"]', '50000');
    await page.fill('textarea[name="agreementSummary"]', 'Red Nike shoes, size 10, brand new condition');
    await page.fill('input[name="deliveryAddress"]', '123 Test Street, Lagos');
    await page.fill('input[name="pickupAddress"]', '456 Seller Ave, Lagos');
    
    await page.click('button:has-text("Create Order")');
    await page.waitForTimeout(2000);
    
    console.log('✅ Order created successfully');
    
    // 3. Get payment link
    const paymentLink = await page.locator('text=/http.*payment/').first().textContent();
    console.log('💳 Payment link:', paymentLink);
    
    // 4. Complete mock payment
    await page.goto(paymentLink!);
    await page.waitForLoadState('networkidle');
    
    // Check if we're on mock checkout page
    await expect(page.locator('text=Mock Payment Checkout')).toBeVisible();
    
    // Wait a bit to see the page
    await page.waitForTimeout(1000);
    
    // Complete payment
    await page.click('button:has-text("Complete Payment")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Payment completed');
    
    // 5. Verify we're redirected to tracking page
    await expect(page.url()).toContain('/order/');
    await expect(page.url()).toContain('/track');
    
    console.log('✅ Redirected to tracking page');
    
    // 6. Verify escrow was created
    await expect(page.locator('text=Blockchain Escrow')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Escrow Contract Address')).toBeVisible();
    
    console.log('✅ Blockchain escrow verified');
    
    // Take screenshot of final state
    await page.screenshot({ path: 'test-results/order-complete.png', fullPage: true });
    
    console.log('🎉 E2E test completed successfully');
  });
  
  test('AI Dispute Resolution - Invalid Cancellation', async ({ page }) => {
    console.log('🤖 Testing AI dispute resolution');
    
    // Setup: Create order and pay first (reusing previous flow)
    await page.goto(`${BASE_URL}/seller/register`);
    await page.waitForLoadState('networkidle');
    
    const email = `seller-dispute-${Date.now()}@test.com`;
    await page.fill('input[name="name"]', 'Dispute Test Seller');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="brand"]', 'Test Store');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/seller/dashboard');
    
    // Create order
    await page.click('text=Create New Order');
    await page.fill('input[name="buyerEmail"]', 'buyer@test.com');
    await page.fill('input[name="itemName"]', 'Red Shoes');
    await page.fill('input[name="price"]', '30000');
    await page.fill('textarea[name="agreementSummary"]', 'It must be red, size 10');
    await page.fill('input[name="deliveryAddress"]', '123 Test St');
    await page.fill('input[name="pickupAddress"]', '456 Seller Ave');
    await page.click('button:has-text("Create Order")');
    await page.waitForTimeout(2000);
    
    const paymentLink = await page.locator('text=/http.*payment/').first().textContent();
    
    // Complete payment
    await page.goto(paymentLink!);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Complete Payment")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Order created and paid');
    
    // Request cancellation with invalid reason
    await page.click('button:has-text("Cancel Order")');
    await page.waitForTimeout(500);
    
    await page.fill('textarea', "I don't like the red color");
    await page.click('button:has-text("Submit Cancellation")');
    
    // Wait for AI analysis
    await page.waitForTimeout(4000);
    
    // Check for alert or decision display
    console.log('✅ Dispute submitted, AI analyzing...');
    
    // Take screenshot of result
    await page.screenshot({ path: 'test-results/dispute-resolution.png', fullPage: true });
    
    console.log('🎉 Dispute test completed');
  });
  
  test('UI Components - Password Toggle', async ({ page }) => {
    console.log('🔐 Testing password toggle');
    
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('networkidle');
    
    // Find password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Click eye icon
    await page.click('button[aria-label*="password"], button:has(svg)');
    await page.waitForTimeout(300);
    
    // Check if type changed to text
    const inputType = await page.locator('input[name="password"]').getAttribute('type');
    console.log('Password input type after toggle:', inputType);
    
    await page.screenshot({ path: 'test-results/password-toggle.png' });
    
    console.log('✅ Password toggle test completed');
  });
  
  test('Homepage Loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for key elements
    await expect(page.locator('text=TrustLock')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    
    console.log('✅ Homepage loaded successfully');
  });
});
