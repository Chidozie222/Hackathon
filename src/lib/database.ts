import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// User types
export interface User {
    id: string;
    type: 'SELLER' | 'BUYER' | 'RIDER';
    name: string;
    email: string;
    phone: string;
    password: string;
    brandName?: string;
    website?: string;
    vehicleType?: string;
    licensePlate?: string;
    nin?: string;
    identityVerified?: boolean;
    verifiedAt?: number;
    walletAddress?: string;
    createdAt: number;
}

// Order types
export interface Order {
    id: string;
    sellerId: string;
    itemName: string;
    price: string;
    buyerPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    productPhoto: string;
    agreementSummary: string;
    riderType: 'PERSONAL' | 'PLATFORM';
    riderId?: string;
    riderAccessToken?: string;
    acceptedAt?: number;
    qrCode: string;
    status: 'PENDING_PAYMENT' | 'PAID' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'DISPUTED' | 'COMPLETED';
    buyerLink: string;
    paymentReference?: string;
    escrowAddress?: string;
    agreementHash?: string;
    agreementTxHash?: string;
    cancellationRequested?: boolean;
    cancellationReason?: string;
    cancellationRequestedAt?: number;
    disputeResolution?: {
        aiDecision: 'REFUND_BUYER' | 'PAY_SELLER';
        aiExplanation: string;
        resolvedAt: number;
    };
    pickupTime?: number;
    deliveryTime?: number;
    createdAt: number;
}

// Dispute types
export interface Dispute {
    id: string;
    orderId: string;
    buyerReason: string;
    aiAnalysis: {
        aligned: boolean;
        confidence: number;
        explanation: string;
    };
    status: 'PENDING' | 'REFUNDED' | 'RELEASED' | 'UNDER_REVIEW';
    createdAt: number;
}

// Ensure data directory and files exist
function ensureDataFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const files = ['users.json', 'orders.json', 'disputes.json'];
    files.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
    });
}

// Users
export function getUsers(): User[] {
    ensureDataFiles();
    const data = fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf-8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function addUser(user: User) {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
}

export function getUserById(id: string): User | undefined {
    return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
    return getUsers().find(u => u.email === email);
}

// Orders
export function getOrders(): Order[] {
    ensureDataFiles();
    const data = fs.readFileSync(path.join(DATA_DIR, 'orders.json'), 'utf-8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function addOrder(order: Order) {
    const orders = getOrders();
    orders.push(order);
    fs.writeFileSync(path.join(DATA_DIR, 'orders.json'), JSON.stringify(orders, null, 2));
}

export function getOrderById(id: string): Order | undefined {
    return getOrders().find(o => o.id === id);
}

export function updateOrder(id: string, updates: Partial<Order>) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        fs.writeFileSync(path.join(DATA_DIR, 'orders.json'), JSON.stringify(orders, null, 2));
    }
}

// Disputes
export function getDisputes(): Dispute[] {
    ensureDataFiles();
    const data = fs.readFileSync(path.join(DATA_DIR, 'disputes.json'), 'utf-8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function addDispute(dispute: Dispute) {
    const disputes = getDisputes();
    disputes.push(dispute);
    fs.writeFileSync(path.join(DATA_DIR, 'disputes.json'), JSON.stringify(disputes, null, 2));
}

export function updateDispute(id: string, updates: Partial<Dispute>) {
    const disputes = getDisputes();
    const index = disputes.findIndex(d => d.id === id);
    if (index !== -1) {
        disputes[index] = { ...disputes[index], ...updates };
        fs.writeFileSync(path.join(DATA_DIR, 'disputes.json'), JSON.stringify(disputes, null, 2));
    }
}
