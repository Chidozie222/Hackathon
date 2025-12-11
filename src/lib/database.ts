import connectDB from './mongodb';
import { User, IUser } from '../models/User';
import { Order, IOrder } from '../models/Order';

// ========== USER OPERATIONS ==========

export async function addUser(userData: Omit<IUser, '_id'>): Promise<IUser> {
    await connectDB();
    const user = await User.create(userData);
    return user.toObject();
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    return user as IUser | null;
}

export async function getUserById(id: string): Promise<IUser | null> {
    await connectDB();
    const user = await User.findOne({ id }).lean();
    return user as IUser | null;
}

export async function getAllUsers(): Promise<IUser[]> {
    await connectDB();
    const users = await User.find().lean();
    return users as IUser[];
}

export async function updateUser(id: string, updates: Partial<IUser>): Promise<void> {
    await connectDB();
    await User.updateOne({ id }, { $set: updates });
}

// ========== ORDER OPERATIONS ==========

export async function addOrder(orderData: Omit<IOrder, '_id'>): Promise<IOrder> {
    await connectDB();
    const order = await Order.create(orderData);
    return order.toObject();
}

export async function getOrderById(id: string): Promise<IOrder | null> {
    await connectDB();
    const order = await Order.findOne({ id }).lean();
    return order as IOrder | null;
}

export async function getAllOrders(): Promise<IOrder[]> {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function updateOrder(id: string, updates: Partial<IOrder>): Promise<void> {
    await connectDB();
    await Order.updateOne({ id }, { $set: updates });
}

export async function getOrdersBySellerId(sellerId: string): Promise<IOrder[]> {
    await connectDB();
    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function getOrdersByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const orders = await Order.find({ riderId }).sort({ createdAt: -1 }).lean();
    return orders as IOrder[];
}

export async function getAvailableJobs(): Promise<IOrder[]> {
    await connectDB();
    const jobs = await Order.find({
        riderType: 'PLATFORM',
        status: 'PAID',
        riderId: { $exists: false }
    }).sort({ createdAt: -1 }).lean();
    return jobs as IOrder[];
}

export async function getActiveJobsByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const jobs = await Order.find({
        riderId,
        status: { $in: ['PAID', 'IN_TRANSIT', 'PICKED_UP'] }
    }).sort({ createdAt: -1 }).lean();
    return jobs as IOrder[];
}

export async function getCompletedJobsByRiderId(riderId: string): Promise<IOrder[]> {
    await connectDB();
    const jobs = await Order.find({
        riderId,
        status: 'DELIVERED'
    }).sort({ deliveryTime: -1 }).lean();
    return jobs as IOrder[];
}

// ========== LEGACY COMPATIBILITY ==========
// Keep these for backward compatibility with existing code

export { IUser as User, IOrder as Order };
