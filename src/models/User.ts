import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id?: string;
    id: string;
    type: 'SELLER' | 'RIDER';
    name: string;
    email: string;
    phone: string;
    password: string;
    brandName?: string;
    website?: string;
    vehicleType?: string;
    licensePlate?: string;
    nin?: string; // Encrypted
    identityVerified?: boolean;
    verifiedAt?: number;
    createdAt: number;
}

const UserSchema = new Schema<IUser>({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['SELLER', 'RIDER'] },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    brandName: String,
    website: String,
    vehicleType: String,
    licensePlate: String,
    nin: String, // Encrypted
    identityVerified: Boolean,
    verifiedAt: Number,
    createdAt: { type: Number, required: true }
}, {
    timestamps: false,
    collection: 'users'
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ id: 1 });
UserSchema.index({ type: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
