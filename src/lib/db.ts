import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'escrows.json');

export interface ManagedEscrow {
    id: string;
    buyerEmail: string; // "User"
    sellerEmail: string;
    amount: string;
    status: 'PENDING' | 'APPROVED';
    txHash?: string;
    escrowAddress?: string; // If we can get it from events, or just tracking the tx
    createdAt: number;
}

function ensureDB() {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
}

export function getManagedEscrows(): ManagedEscrow[] {
    ensureDB();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function addManagedEscrow(escrow: ManagedEscrow) {
    const escrows = getManagedEscrows();
    escrows.push(escrow);
    fs.writeFileSync(DB_PATH, JSON.stringify(escrows, null, 2));
}

export function updateManagedEscrow(id: string, updates: Partial<ManagedEscrow>) {
    const escrows = getManagedEscrows();
    const index = escrows.findIndex(e => e.id === id);
    if (index !== -1) {
        escrows[index] = { ...escrows[index], ...updates };
        fs.writeFileSync(DB_PATH, JSON.stringify(escrows, null, 2));
    }
}
