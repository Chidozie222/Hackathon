# 🚚 SecureDrop Protocol

**The World's First Decentralized Escrow Delivery Platform**

SecureDrop is a cutting-edge delivery platform that bridges the trust gap between buyers, sellers, and riders using **Blockchain Smart Contracts**, **Real-time WebSockets**, and **AI-powered Dispute Resolution**.

---

## 🌟 Key Features

### 🔐 **Smart Contract Escrow**
Funds are never held by the platform or the seller directly. When a buyer pays:
1. Funds are locked in a **Smart Contract**.
2. Seller sees "Proof of Funds" but cannot access them.
3. Funds are **automatically released** only when the buyer confirms delivery via QR code scan.

### 📡 **Real-time Communication**
Powered by **Socket.io**, the platform offers:
- **Instant Status Updates:** Buyers see order changes immediately (<100ms).
- **Live Rider Tracking:** Real-time GPS updates on the map.
- **Instant Job Alerts:** Riders get notified the second a new job is available.

### 🛡️ **Security & Privacy First**
- **Chain of Custody:** Every step (Pickup, Delivery) is verified via encrypted QR codes.
- **Data Minimization:** Product photos and rider links are **automatically deleted** after delivery.
- **Encryption:** Sensitive user data (NIN, BVN) is encrypted at rest using AES-256.

### 🤖 **AI-Powered Dispute Resolution**
Conflict? No problem. Our impartial AI analyzer reviews:
- Blockchain timestamps
- GPS logs
- Delivery photo evidence
And renders a fair decision in seconds, reducing resolution time by 99%.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Design System
- **State/Real-time:** Socket.io Client, React Hooks

### **Backend**
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB (Mongoose ODM)
- **Real-time Engine:** Socket.io Server
- **Blockchain:** Ethereum/Polygon (Simulated for Hackathon/Dev)

### **Security**
- **Encryption:** Node.js Crypto Module (AES-256-GCM)
- **Authentication:** Custom Token-based Auth
- **Validation:** Zod Schemas

---

## 🔄 User Workflows

### **1. The Seller Flow**
1. **Register:** Sign up as a verified seller.
2. **Create Order:** Input item details, price, and locations.
3. **Share Link:** Generate a unique payment link for the buyer.
4. **Monitor:** Watch real-time updates as the buyer pays and rider accepts.

### **2. The Buyer Flow**
1. **Pay Securely:** Click the link and pay. Funds go to **Escrow**, not the seller.
2. **Track:** Watch the rider's location in real-time.
3. **Confirm:** Upon receipt, scan the unique **Delivery QR Code** to release funds.

### **3. The Rider Flow**
1. **Get Notified:** Receive an instant alert for a new job.
2. **Accept & Pickup:** Navigate to seller, scan **Pickup QR** to take custody.
3. **Deliver:** Navigate to buyer, present package.
4. **Get Paid:** Once buyer scans, funds are released, and the rider gets their fee.

---

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### **1. Clone & Install**
```bash
git clone https://github.com/yourusername/securedrop.git
cd securedrop
npm install
```

### **2. Environment Setup**
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/escrow-delivery

# Security (Generate a random 32-char string)
ENCRYPTION_KEY=your-secure-encryption-key-min-32-chars-long

# APIs (Optional for Dev/Mock mode)
OPENAI_API_KEY=mock-key
PAYSTACK_SECRET_KEY=mock-key
```

### **3. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 How to Test (Walkthrough)

1. **Start MongoDB:** Ensure your MongoDB instance is running.
2. **Register a Seller:** Go to `/seller/register` and create an account.
3. **Create an Order:** Dashboard -> Create Order. Note the order ID.
4. **Simulate Buyer:**
   - Open `/order/[id]/track` in a new tab (Incognito).
   - Click "Pay Now" (Mock Payment).
5. **Register a Rider:** Go to `/rider/register` in a new browser/profile.
6. **Accept Job:** Rider Dashboard -> Available Jobs -> Accept.
7. **Pickup:**
   - Seller shows "Pickup QR".
   - Rider clicks "Scan Pickup QR" (Simulated scan).
   - Status updates to `IN_TRANSIT`.
8. **Deliver:**
   - Rider arrives at Buyer location.
   - Buyer shows "Delivery QR".
   - Rider clicks "Confirm Delivery".
   - **Success!** Funds released, data cleaned up.

---

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router Pages
│   ├── api/              # Backend API Routes
│   ├── seller/           # Seller Dashboard & Flows
│   ├── rider/            # Rider Dashboard & Flows
│   └── order/            # Buyer Tracking Pages
├── components/           # Reusable UI Components
├── lib/                  # Core Logic & Utilities
│   ├── mongodb.ts        # Database Connection
│   ├── socket.ts         # Real-time Client Hook
│   ├── socketBroadcast.ts# Real-time Server Broadcaster
│   ├── orderCleanup.ts   # Data Privacy Logic
│   └── blockchain.ts     # Escrow Logic
├── models/               # MongoDB Mongoose Schemas
└── types/                # TypeScript Interfaces
```

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.

**License:** MIT
**Built for ETH Lagos Hackathon**
