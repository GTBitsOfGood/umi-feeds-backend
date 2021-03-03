import mongoose, {Schema} from 'mongoose';

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
};

const userSchema = new mongoose.Schema<UserDocument>({
    name: String,
    email: { type: String, unique: true }, // later down the line, we will make this optional for recipients
    pushTokens: [String], // expo push tokens
    donorInfo: { type: new Schema({
            // all of these attributes are about the business
            // these attributes are required if donorInfo is present
            name: String,
            phone: String,
            address: String,
            longitude: Number,
            latitude: Number
        }),
        required: false,
    },
    volunteerInfo: {
        type: new Schema({
            phone: String,
        }),
        required: false,
    },
    recipient: Boolean,
    admin: Boolean // in reality, admin access will be based on the Auth0 token, not this attribute
}, { timestamps: true });

export const User = mongoose.model<UserDocument>('User', userSchema);
