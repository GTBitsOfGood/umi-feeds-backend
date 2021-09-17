import mongoose from 'mongoose';

export type Address = {
    _id?: string; // the unqiue id assigned to a dish. Let Mongo create this when you insert a document without any _id attribute
    streetAddress: string;
    buildingNumber: number;
    city: string;
    state: string;
    zipCode: number;
    longitude: number;
    latitude: number;
}

export const AddressSchema = new mongoose.Schema<Address>({
    streetAddress: { type: String, required: true },
    buildingNumber: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: Number, required: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
});
