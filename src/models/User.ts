// DO NOT USE ANYTHING IN THIS FILE ANYMORE

import mongoose from 'mongoose';

type Address = {
    // include _id
    businessName: string;
    streetAddress: string;
    buildingNumber: number;
    city: string;
    state: string;
    zipCode: number;
    longitude: number;
    latitude: number;
}

type Dish = {
    // include _id
    dishName: string;
    cost: number;
    pounds: number;
    allergens: string[];
    imageLink: string;
    comments: string;
}

type DonationDishes = {
    dishID: string;
    quantity: number;
}

type DonationForm = {
    // include _id
    ongoing: boolean;
    imageLink: string;
    dishes: DonationDishes[];
    pickupAddress: Address;
    pickupInstructions: string;
    pickupStartTime: Date;
    pickupEndTime: Date;
}

export type MockUserDocument = mongoose.Document & {
    // include _id
    name: string;
    email: string;
    phoneNumber: number;
    pushTokens: string[];
    isAdmin: boolean;
    auth0AccessToken: string;
    roles: string[];
    pickupAddresses: Address[];
    dishes: Dish[];
    donations: DonationForm[];
}

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
