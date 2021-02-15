import mongoose, {Schema, Document} from 'mongoose';

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
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: true
    },
},{ timestamps: true });

export const Donor = mongoose.model<DonorDocument>('Donor', donorSchema);
    