import { Response, Request } from 'express';
import { Document } from 'mongoose';
// eslint-disable-next-line camelcase
import { User } from '../models/User/';
import { Dish, DishSchema } from "../models/User/Dishes"


/**
 * Gets Dishes belonging to the User
 * @route GET /dishes?id=<string>
 *
 * */
export const getDishesByUser = (req: Request, res: Response) => {
    const userId = req.query.id;
    return User.findOne({ _id: userId, dishes: { $exists: true } }, 'dishes')
        //.then(result => { res.status(200).json({ dishes: result }) })
        .then(result => { res.status(200).send(result) })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};


/**
 * Gets Dish matching user's id and dishID
 * @route GET /dishes?id=<string>&dishID=<string>
 *
 * */
 export const getDishByUserAndDishID = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.dishID
    return User.findOne({ _id: userId, "dishes._id": dishId }, { _id: 0, dishes: { $elemMatch: { _id: dishId } } })
        //.then(result => { res.status(200).json({ dish: result }) })
        .then(result => { res.status(200).send(result) })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
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

    return User.updateOne({ _id: userId, "dishes.id": dishId }, { $pull: { dishes: {_id: dishId} } })
        .then(result => { res.status(200).json({ dish: result }) })
        //.send(result)
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};



