import { Response, Request } from 'express';
// eslint-disable-next-line camelcase
import { User } from '../models/User/';
import { Dish, DishSchema } from "../models/User/Dishes"
import mongoose from 'mongoose';


/**
 * Gets Dishes based on User and Dish id
 * @route GET /dishes?id=<string>
 * @route GET /dishes?id=<string>&dishID=<string>
 *
 * */
export const getDishes = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.dishID
    if (userId && dishId) {
        return User.findOne({ _id: userId, "dishes._id": dishId }, { _id: 0, dishes: { $elemMatch: { _id: dishId } } })
        .then(result => { 
            if (result) {
                res.status(200).send(result)
            } else {
                res.status(404).json({message: "User or dish does not exist in the database."});
            }
        })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
    });
    } else if (userId) {
        return User.findOne({ _id: userId, dishes: { $exists: true } }, { _id: 0, dishes: 1})
            .then(result => { 
                if (result) {
                    res.status(200).send(result)
                } else {
                    res.status(404).json({message: "User does not exist in the database."});
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    } else {
        res.status(400).json({ message: "Missing user id and/or dish id"})
    }
};

/**
 * Post
 * @route POST /dishes?id=<string>
 *
 * */
 export const postDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishBody = req.body; 

    // Handle Images
    return User.updateOne({ _id: userId },  { $push: { dishes: dishBody } },)
        .then(result => { res.status(200).json({ dish: result }) })
        //.send(result)
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};


/**
 * Update matching dish
 * @route PUT /dishes?id=<string>&dishID=<string>
 *
 * */
 export const updateDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.dishID;
    const dishBody = req.body; 
    const id = mongoose.Types.ObjectId();
    dishBody["_id"] = id;
    // Handle Images
    return User.updateOne({ _id: userId, "dishes._id": dishId }, { $set: { dishes: dishBody } },)
        .then(result => { res.status(200).json({ dish: result }) })
        //.send(result)
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};


/**
 * Delete matching dish
 * @route POST /dishes?id=<string>&donationFormID=<string>
 *
 * */
export const deleteDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.donationFormID;

    return User.updateOne({ _id: userId, "dishes._id": dishId }, { $pull: { dishes: { _id: dishId } } })
        .then(result => { 
            if (result.nModified != 0) {
                res.status(200).json({ message: "Success" })
            } else {
                res.status(404).json({ message: "This user or specified dish does not exist." })
            }
        })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};



