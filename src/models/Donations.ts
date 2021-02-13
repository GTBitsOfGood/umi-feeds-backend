import mongoose, { Model, Schema, Document } from 'mongoose';
import { DonorDocument } from './Donor'

export type DonationsDocument = Document & {
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
    foodImages: string;
}

const donationsSchema = new Schema<DonationsDocument>({
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
        type: String,
        default: []
    }
});

export const Donations: Model<DonationsDocument> = mongoose.model<DonationsDocument>('Donation', donationsSchema);

