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
  dropOffAddress: Address;
  dropOffInstructions: string;
  volunteerLockTime: Date; // time when volunteer agrees to pick it up
  lockedByVolunteer: boolean; // whether the donation has been locked by a volunteer
  confirmPickUpTime: Date; // time when donation has been picked up by volunteer
  confirmDropOffTime: Date; // time when donation has been dropped off by volunteer
  name: string;
  businessName: string;
  email: string;
  phoneNumber: number;
}

export const DonationDishesSchema = new mongoose.Schema<DonationDishes>({
    dishID: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
});

// Status will be a ENUM once the status are actually set
export const DonationFormSchema = new mongoose.Schema<DonationForm>({
    ongoing: { type: Boolean, required: true },
    status: {
        type: String,
        required: true
    },
    imageLink: { type: String, required: false },
    donationDishes: { type: [DonationDishesSchema], required: true },
    pickupAddress: { type: AddressSchema, required: true },
    pickupInstructions: { type: String, default: 'None' },
    pickupStartTime: { type: Date, required: true },
    pickupEndTime: { type: Date, required: true },
    dropOffAddress: { type: AddressSchema, default: undefined },
    dropOffInstructions: { type: String, default: 'None ' },
    lockedByVolunteer: { type: Boolean, required: true },
    confirmPickUpTime: { type: Date, default: undefined },
    volunteerLockTime: { type: Date, default: undefined },
    confirmDropOffTime: { type: Date, default: undefined },
}, { timestamps: true });

export type OngoingDonationDocument = mongoose.Document & {
  _id?: string; // the unqiue id assigned to a donation form. Let Mongo create this when you insert a document without any _id attribute
  businessName: string;
  ongoing: boolean;
  status: string;
  imageLink: string;
  donationDishes: DonationDishes[];
  pickupAddress: Address;
  pickupInstructions: string;
  pickupStartTime: Date;
  pickupEndTime: Date;
  dropOffAddress: Address;
  dropOffInstructions: string;
  volunteerLockTime: Date; // time when volunteer agrees to pick it up
  lockedByVolunteer: boolean; // whether the donation has been locked by a volunteer
  confirmPickUpTime: Date; // time when donation has been picked up by volunteer
  confirmDropOffTime: Date; // time when donation has been dropped off by volunteer
  userID: string;
  volunteerUserID: string;
}

// Status will be a ENUM once the status are actually set
const OngoingDonationsSchema = new mongoose.Schema<OngoingDonationDocument>({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true },
    businessName: { type: String, required: true },
    ongoing: { type: Boolean, required: true, default: true },
    status: {
        type: String,
        required: true,
    },
    imageLink: { type: String, required: false },
    donationDishes: { type: [DonationDishesSchema], required: true },
    pickupAddress: { type: AddressSchema, required: true },
    pickupInstructions: { type: String, default: 'None' },
    pickupStartTime: { type: Date, required: true },
    pickupEndTime: { type: Date, required: true },
    dropOffAddress: { type: AddressSchema, default: undefined },
    dropOffInstructions: { type: String, default: 'None ' },
    lockedByVolunteer: { type: Boolean, required: true },
    confirmPickUpTime: { type: Date, default: undefined },
    volunteerLockTime: { type: Date, default: undefined },
    confirmDropOffTime: { type: Date, default: undefined },
    volunteerUserID: { type: String, default: undefined }
}, { timestamps: true });

export const OngoingDonation = mongoose.model<OngoingDonationDocument>('ongoingdonations', OngoingDonationsSchema);
