// DO NOT USE ANYMORE

import mongoose, { Model, Schema, Document } from 'mongoose';
import { UserDocumentDeprecated } from './User';

export interface DonationDocument extends Document {
    donor: UserDocumentDeprecated['_id'];
    volunteer?: UserDocumentDeprecated['_id'];
    availability: {
        startTime: Date;
        endTime: Date;
    };
    pickup?: {
        reservedByVolunteerTime?: Date, // when a volunteer says that they're starting to pick it up
        pickupTime?: Date,
        dropoffTime?: Date,
        donorConfirmationTime?: Date, // when a donor confirms that it has been picked up
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
        ref: 'UserDeprecated',
        required: true
    },
    volunteer: {
        type: Schema.Types.ObjectId,
        ref: 'UserDeprecated'
    },
    availability: {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    },
    pickup: {
        reservedByVolunteerTime: Date,
        pickupTime: Date,
        dropoffTime: Date,
        donorConfirmationTime: Date
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