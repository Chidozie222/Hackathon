import connectDB from './mongodb';
import { User as UserModel } from '../models/User';
import type { IUser } from '../models/User';
import { Order as OrderModel } from '../models/Order';
import type { IOrder } from '../models/Order';

// ========== USER OPERATIONS ==========

export async function addUser(userData: Omit<IUser, '_id'>): Promise<IUser> {
    await connectDB();
    const user = await UserModel.create(userData);
    return user.toObject();
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    const user = await UserModel.findOne({ email }).lean();
    return user as IUser | null;
}

export async function getUserById(id: string): Promise<IUser | null> {
    await connectDB();
    const user = await UserModel.findOne({ id }).lean();
    return user as IUser | null;
}

export async function getAllUsers(): Promise<IUser[]> {
    await connectDB();
    const users = await UserModel.find().lean();
    return users as IUser[];
}

export async function updateUser(id: string, updates: Partial<IUser>): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ id }, { $set: updates });
}

// ========== ORDER OPERATIONS ==========

export async function addOrder(orderData: Omit<IOrder, '_id'>): Promise<IOrder> {
    await connectDB();
    const order = await OrderModel.create(orderData);
    return order.toObject();
}

export async function getOrderById(id: string): Promise<IOrder | null> {
    await connectDB();
    // Try finding by custom 'id' first
    let order = await OrderModel.findOne({ id }).lean();
    
    // If not found, and it looks like a MongoDB _id, try finding by _id
    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await OrderModel.findById(id).lean();
    }
    
    return order as IOrder | null;
}

export async function getAllOrders(): Promise<IOrder[]> {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function updateOrder(id: string, updates: Partial<IOrder>): Promise<void> {
    await connectDB();
    
    // Try updating by custom 'id'
    const result = await OrderModel.updateOne({ id }, { $set: updates });
    
    // If no document matched, and it looks like a MongoDB _id, try updating by _id
    if (result.matchedCount === 0 && id.match(/^[0-9a-fA-F]{24}$/)) {
        await OrderModel.findByIdAndUpdate(id, { $set: updates });
    }
}

export async function assignRiderToOrder(orderId: string, riderId: string): Promise<IOrder | null> {
    await connectDB();
    
    const updates = { 
        riderId, 
        acceptedAt: Date.now() 
    };

    // Atomic update: Only update if riderId does not exist (or is null)
    // Try custom 'id' first
    let order = await OrderModel.findOneAndUpdate(
        { id: orderId, riderId: { $exists: false } },
        { $set: updates },
        { new: true }
    ).lean();

    // Fallback to _id
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await OrderModel.findOneAndUpdate(
            { _id: orderId, riderId: { $exists: false } },
            { $set: updates },
            { new: true }
        ).lean();
    }

    return order as IOrder | null;
}

export async function unassignRiderFromOrder(orderId: string, riderId: string): Promise<IOrder | null> {
    await connectDB();
    
    // Atomic update: Only update if riderId matches (security)
    // Try custom 'id' first
    let order = await OrderModel.findOneAndUpdate(
        { id: orderId, riderId: riderId },
        { 
            $unset: { riderId: "", acceptedAt: "" }
        },
        { new: true }
    ).lean();

    // Fallback to _id
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await OrderModel.findOneAndUpdate(
            { _id: orderId, riderId: riderId },
            { 
                $unset: { riderId: "", acceptedAt: "" }
            },
            { new: true }
        ).lean();
    }

    return order as IOrder | null;
}

export async function getOrdersBySellerId(sellerId: string): Promise<IOrder[]> {
    await connectDB();
    const orders = await OrderModel.find({ sellerId }).sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function getOrdersByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const orders = await OrderModel.find({ riderId }).sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function getAvailableJobs(): Promise<IOrder[]> {
    await connectDB();
    const jobs = await OrderModel.find({
        riderType: 'PLATFORM',
        status: 'PAID',
        riderId: { $exists: false }
    }).sort({ createdAt: -1 }).lean();
    return jobs as IOrder[];
}

export async function getActiveJobsByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const jobs = await OrderModel.find({
        riderId,
        status: { $in: ['PAID', 'IN_TRANSIT', 'PICKED_UP'] }
    }).sort({ createdAt: -1 }).lean();
    return jobs as IOrder[];
}

export async function getCompletedJobsByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const jobs = await OrderModel.find({
        riderId,
        status: 'DELIVERED'
    }).sort({ deliveryTime: -1 }).lean();
    return jobs as IOrder[];
}

// ========== LEGACY COMPATIBILITY ==========
// Keep these for backward compatibility with existing code
// We export the Interfaces as User/Order to match previous type definitions

export type { IUser as User, IOrder as Order };
