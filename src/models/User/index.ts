import mongoose from 'mongoose';

import { Address, AddressSchema } from './Address';
import { Dish, DishSchema } from './Dishes';
import { DonationForm, DonationFormSchema } from './DonationForms';

export type UserDocument = mongoose.Document & {
  _id?: string; // the unqiue id assigned to a dish. Let Mongo create this when you insert a document without any _id attribute
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

const userSchema = new mongoose.Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // later down the line, we will make this optional for recipients
    pushTokens: { type: [String], required: true }, // expo push tokens
    phoneNumber: { type: Number, required: true },
    isAdmin: { type: Boolean, require: true },
    auth0AccessToken: { type: String, required: true },
    roles: { type: [String], required: true }, // expo push tokens
    pickupAddresses: { type: [AddressSchema], required: true },
    dishes: { type: [DishSchema], required: true },
    donations: { type: [DonationFormSchema], required: true },
}, { timestamps: true });

export const User = mongoose.model<UserDocument>('users', userSchema);
