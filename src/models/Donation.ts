import mongoose, { Model, Schema, Document } from 'mongoose';
import { UserDocument } from './User';

export interface DonationDocument extends Document {
    donor: UserDocument['_id'];
    availability: {
        startTime: Date;
        endTime: Date;
    };
    pickup?: {
        pickupTime: Date;
        dropoffTime: Date;
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
        ref: 'User',
        required: true
    },
    availability: {
        type: new Schema({
            startTime: {
                type: Date,
                required: true
            },
            endTime: {
                type: Date,
                required: true
            }
        }),
        required: true
    },
    pickup: {
        pickupTime: Date,
        dropoffTime: Date
    },
    description: {
        type: String,
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
    },
}, { timestamps: true });

export const Donation: Model<DonationDocument> = mongoose.model<DonationDocument>('Donation', donationSchema);
