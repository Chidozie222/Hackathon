import mongoose, { Schema, Model } from 'mongoose';

export interface IOrder {
    _id?: string;
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
    sanitized?: boolean;
    sanitizedAt?: number;
    createdAt: number;
}

const OrderSchema = new Schema<IOrder>({
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true },
    itemName: { type: String, required: true },
    price: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    productPhoto: String,
    agreementSummary: { type: String, required: true },
    riderType: { type: String, required: true, enum: ['PERSONAL', 'PLATFORM'] },
    riderId: String,
    riderAccessToken: String,
    acceptedAt: Number,
    qrCode: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['PENDING_PAYMENT', 'PAID', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DISPUTED', 'COMPLETED']
    },
    buyerLink: { type: String, required: true },
    paymentReference: String,
    escrowAddress: String,
    agreementHash: String,
    agreementTxHash: String,
    cancellationRequested: Boolean,
    cancellationReason: String,
    cancellationRequestedAt: Number,
    disputeResolution: {
        aiDecision: { type: String, enum: ['REFUND_BUYER', 'PAY_SELLER'] },
        aiExplanation: String,
        resolvedAt: Number
    },
    pickupTime: Number,
    deliveryTime: Number,
    sanitized: Boolean,
    sanitizedAt: Number,
    createdAt: { type: Number, required: true }
}, {
    timestamps: false,
    collection: 'orders'
});

// Create indexes for efficient queries
// OrderSchema.index({ id: 1 }); // Removed to prevent duplicate index warning
OrderSchema.index({ sellerId: 1 });
OrderSchema.index({ riderId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ riderType: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
