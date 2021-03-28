import mongoose from 'mongoose';

export type UserDocument = mongoose.Document & {
    name: string;
    email: string; // later down the line, we will make this optional for recipients
    pushTokens: string[]; // expo push tokens
    donorInfo?: {
        // all of these attributes are about the business
        // these attributes are required if donorInfo is present
        name: string;
        phone: string;
        address: string;
        longitude: number;
        latitude: number;
    };
    volunteerInfo?: {
        phone: string;
    };
    recipient: boolean;
    admin: boolean; // in reality, admin access will be based on the Auth0 token, not this attribute
    sub: string;
};

const userSchema = new mongoose.Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // later down the line, we will make this optional for recipients
    pushTokens: { type: [String], required: true }, // expo push tokens
    donorInfo: {
        type: {
            // all of these attributes are about the business
            // these attributes are required if donorInfo is present
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            longitude: { type: Number, required: true },
            latitude: { type: Number, required: true },
        },
        required: false
    },
    volunteerInfo: {
        type: {
            phone: { type: String, required: true }
        },
        required: false
    },
    recipient: { type: Boolean, required: true },
    admin: { type: Boolean, required: true }, // in reality, admin access will be based on the Auth0 token, not this attribute
    sub: { type: String, required: true, unique: true }
}, { timestamps: true });

export const User = mongoose.model<UserDocument>('User', userSchema);
