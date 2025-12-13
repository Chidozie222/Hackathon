# Test Scripts

This folder contains utility scripts for testing and debugging the application.

## Database Testing

- **insert-test-order.js** - Creates a test order with GPS location data for testing the live map feature
- **create-test-job.js** - Creates test jobs for rider dashboard testing
- **debug-list-orders.js** - Lists all orders in the database
- **debug-order-details.js** - Shows detailed information about a specific order (usage: `node debug-order-details.js [orderId]`)
- **debug-jobs.js** - Debugs job/order listings

## User Management

- **patch-users-correct.js** - Fixes/updates user data in the database

## Feature Testing

- **test-features.js** - General feature testing script
- **test-seller-orders.js** - Tests seller order functionality

## Legacy/Deprecated

- **create-test-order-with-gps.js** - Early version of GPS test order creation (use insert-test-order.js instead)
- **create-test-order-with-gps.mjs** - ES module version (deprecated)
- **create-simple-test-order.js** - Simplified test order creation (deprecated)

## Usage

Run any script from the project root:
```bash
node test-scripts/[script-name].js
```

For scripts that require arguments:
```bash
node test-scripts/debug-order-details.js [orderId]
```
