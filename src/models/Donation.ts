import mongoose, { Model, Schema, Document } from 'mongoose';
import { DonorDocument } from './Donor'

export interface DonationDocument extends Document {
    donor: DonorDocument['_id'];
    availability: {
        startTime: Date,
        endTime: Date
    };
    pickup?: {
        pickupTime: Date,
        dropoffTime: Date,
        // volunteer: Volunteer
    };
    description: string;
    descriptionImages: string[];
    pickupInstructions?: string;
    weight?: number;
    foodImages: string[];
}

const donationSchema = new Schema<DonationDocument>({
    donor: {
        type: Schema.Types.ObjectId,
        required: true
    },
    availability: {
        startTime: Date,
        endTime: Date
    },
    pickup: {
        pickupTime: Date,
        dropoffTime: Date
    },
    description: {
        type: String,
        required: true
    },
    descriptionImages: {
        type: [String],
        default: []
    },
    pickupInstructions: String,
    weight: Number,
    foodImages: {
        type: [String],
        default: [],
    }
});

export const Donation: Model<DonationDocument> = mongoose.model<DonationDocument>('Donation', donationSchema);

