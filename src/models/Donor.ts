import mongoose, { Schema, Document } from 'mongoose';

export interface DonorDocument extends Document {
    name: string;
    longitude: number;
    latitude: number;
}

const donorSchema = new Schema<DonorDocument>({
    name: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Donor = mongoose.model<DonorDocument>('Donor', donorSchema);
