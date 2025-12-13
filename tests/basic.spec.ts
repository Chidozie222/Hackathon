import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('TrustLock Basic Tests', () => {
  
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('dom loaded');
    
    // Check page title or content
    const content = await page.content();
    console.log('Page loaded, checking for TrustLock...');
    
    // More flexible check
    const hasTrustLock = content.includes('TrustLock') || content.includes('Escrow');
    expect(hasTrustLock).toBeTruthy();
    
    console.log('✅ Homepage test passed');
  });
  
  test('Seller registration page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/seller/register`);
    await page.waitForLoadState('networkidle');
    
    // Check for form elements
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    console.log('✅ Registration page test passed');
  });
  
  test('Sign in page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    
    console.log('✅ Sign in page test passed');
  });
  
  test('Can fill registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/seller/register`);
    await page.waitForLoadState('networkidle');
    
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Fill form fields
    await page.fill('input[name="name"]', 'Test Seller');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="brand"]', 'Test Brand');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/registration-form-filled.png' });
    
    console.log('✅ Form fill test passed');
  });
});
