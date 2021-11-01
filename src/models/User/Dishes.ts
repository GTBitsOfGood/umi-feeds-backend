import mongoose from 'mongoose';

export type Dish = {
  _id?: string; // the unqiue id assigned to a dish. Let Mongo create this when you insert a document without any _id attribute
  dishName: string;
  cost: number;
  pounds: number;
  allergens: string[];
  imageLink: string; // link to azure image
  favorite: boolean;
  comments: string;
}

export const DishSchema = new mongoose.Schema<Dish>({
    dishName: { type: String, required: true },
    cost: { type: Number, required: true },
    pounds: { type: Number, required: true },
    allergens: { type: [String], required: true },
    imageLink: { type: String, required: true },
    comments: { type: String, required: true },
    favorite: { type: Boolean, default: false },
});
