import mongoose from 'mongoose';
import { Address, AddressSchema } from './Address';

export type DonationDishes = {
  _id?: string; // the unqiue id assigned to a donation dish. Let Mongo create this when you insert a document without any _id attribute
  dishID: string; // points to the _id field of the Dish Schema
  quantity: number;
}

export type DonationForm = {
  _id?: string; // the unqiue id assigned to a donation form. Let Mongo create this when you insert a document without any _id attribute
  ongoing: boolean;
  status: string;
  imageLink: string;
  donationDishes: DonationDishes[];
  pickupAddress: Address;
  pickupInstructions: string;
  pickupStartTime: Date;
  pickupEndTime: Date;
  volunteerLockTime: Date; // time when volunteer agrees to pick it up
  lockedByVolunteer: boolean; // whether the donation has been locked by a volunteer
  confirmPickUpTime: Date; // time when donation has been picked up by volunteer
  confirmDropOffTime: Date; // time when donation has been dropped off by volunteer
}

export const DonationDishesSchema = new mongoose.Schema<DonationDishes>({
    dishID: { type: String, required: true },
    quantity: { type: Number, required: true },
});

export const DonationFormSchema = new mongoose.Schema<DonationForm>({
    ongoing: { type: Boolean, required: true },
    status: {
        type: String,
        enum: ['pending pickup', 'picked up', 'dropped off', 'Rejected'],
    },
    imageLink: { type: String, required: false },
    donationDishes: { type: [DonationDishesSchema], required: true },
    pickupAddress: { type: AddressSchema, required: true },
    pickupInstructions: { type: String, default: 'None' },
    pickupStartTime: { type: Date, required: true },
    pickupEndTime: { type: Date, required: true },
    lockedByVolunteer: { type: Boolean, required: true },
    confirmPickUpTime: { type: Date, required: true },
    volunteerLockTime: { type: Date, required: true },
}, { timestamps: true });

export type OngoingDonationDocument = mongoose.Document & {
  _id?: string; // the unqiue id assigned to a donation form. Let Mongo create this when you insert a document without any _id attribute
  ongoing: boolean;
  status: string;
  imageLink: string;
  donationDishes: DonationDishes[];
  pickupAddress: Address;
  pickupInstructions: string;
  pickupStartTime: Date;
  pickupEndTime: Date;
  volunteerLockTime: Date; // time when volunteer agrees to pick it up
  lockedByVolunteer: boolean; // whether the donation has been locked by a volunteer
  confirmPickUpTime: Date; // time when donation has been picked up by volunteer
  confirmDropOffTime: Date; // time when donation has been dropped off by volunteer
  userID: string;
}

const OngoingDonationsSchema = new mongoose.Schema<OngoingDonationDocument>({
    userID: { type: String, required: true },
    ongoing: { type: Boolean, required: true, default: true },
    status: {
        type: String,
        enum: ['pending pickup', 'picked up', 'dropped off', 'Rejected'],
    },
    imageLink: { type: String, required: false },
    donationDishes: { type: [DonationDishesSchema], required: true },
    pickupAddress: { type: AddressSchema, required: true },
    pickupInstructions: { type: String, default: 'None' },
    pickupStartTime: { type: Date, required: true },
    pickupEndTime: { type: Date, required: true },
    lockedByVolunteer: { type: Boolean, required: true },
    confirmPickUpTime: { type: Date, required: true },
    volunteerLockTime: { type: Date, required: true },
}, { timestamps: true });

export const OngoingDonation = mongoose.model<OngoingDonationDocument>('ongoingdonations', OngoingDonationsSchema);
