import { Response, Request } from 'express';
// eslint-disable-next-line camelcase
import { User } from '../models/User/';
import mongoose from 'mongoose';
import { uploadImageAzure } from '../util/azure-image';
import { UploadedFile } from 'express-fileupload';


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
                res.status(404).json({message: "The specified user or dish does not exist."});
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
                    res.status(404).json({message: "The specified user does not exist."});
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
        });
    } else {
        res.status(404).json({ message: "Missing user id or dish id for request."})
    }
};

/**
 * Posts dish to User's dishes array field
 * @route POST /dishes?id=<string>
 * @param {UploadedFile?} req.files.dishImage Image of dish 
 * @param {string} req.body.json Stringfied json with updated dish information. 
 * Ex: { "allergens": ["meat"], "dishName": "Chicken Salad", "pounds": 2, "cost": 12.99, "comments": "Made fresh"}
 * */
 export const postDish = (req: Request, res: Response) => {
    const userId = req.query.id;

    if (!userId) {
        res.status(404).json({ message: "Missing user id for request."});
        return;
    }

    if (!req.files.dishImage) {
        res.status(404).json({ message: "No image attached to key 'dishImage' for dish."});
        return;
    }

    if (!req.body.json) {
        res.status(404).json({ message: "No data about dish attached to key 'json'."});
        return;
    }

    if (!req.body.json && !req.files.dishImage) {
        res.status(404).json({ message: "No data about dish attached to key 'json' and no image attached to key 'dishImage'."});
        return;
    }

    Promise.resolve(uploadImageAzure(req.files.dishImage as UploadedFile))
        .then((url) => {
            const dishBody = JSON.parse(req.body.json)
            dishBody["_id"] = mongoose.Types.ObjectId();
            dishBody["imageLink"] = url;

            return User.updateOne({ _id: userId },  { $push: { dishes: dishBody } },)
                .then(result => { 
                    if (result.nModified != 0) {
                        res.status(201).json({ message: "Success" })
                    } else {
                        res.status(404).json({ message: "The specified user does not exist." })
                    }
                })
                .catch((error: Error) => {
                    res.status(400).json({ message: error.message });
                });
        }).catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};

/**
 * Updates matching dish existing in User's dishes array
 * @route PUT /dishes?id=<string>&dishID=<string>
 * @param {UploadedFile?} req.files.dishImage Image of dish 
 * @param {string} req.body.json Stringfied json with updated dish information. 
 * Ex: { "allergens": ["meat"], "dishName": "Chicken Salad", "pounds": 2, "cost": 12.99, "comments": "Made fresh"}
 * */
 export const updateDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.dishID;

    if (!userId) {
        res.status(404).json({ message: "Missing user id for request."});
        return;
    }

    if (!dishId) {
        res.status(404).json({ message: "Missing dish id for request."});
        return;
    }

    if (!req.files.dishImage) {
        res.status(404).json({ message: "No image attached to key 'dishImage' for dish."});
        return;
    }

    if (!req.body.json) {
        res.status(404).json({ message: "No data about dish attached to key 'json'."});
        return;
    }

    if (!req.body.json  && !req.files.dishImage) {
        res.status(404).json({ message: "No data about dish attached to key 'json' and no image attached to key 'dishImage'."});
        return;
    }

    Promise.resolve(uploadImageAzure(req.files.dishImage as UploadedFile)).then((url) => {
        const dishBody = JSON.parse(req.body.json)
        dishBody["_id"] = dishId
        dishBody["imageLink"] = url;

        return User.updateOne({ _id: userId, "dishes._id": dishId }, { $set: { "dishes.$": dishBody } },)
            .then(result => { 
                if (result.nModified != 0) {
                    res.status(201).json({ message: "Success" })
                } else {
                    res.status(404).json({ message: "The specified user or dish does not exist." })
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
};

/**
 * Deletes matching dish from User's dishes array
 * @route DELETE /dishes?id=<string>&donationFormID=<string>
 *
 * */
export const deleteDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.donationFormID;

    if (userId && dishId) {
        return User.updateOne({ _id: userId, "dishes._id": dishId }, { $pull: { dishes: { _id: dishId } } })
            .then(result => { 
                if (result.nModified != 0) {
                    res.status(200).json({ message: "Success" })
                } else {
                    res.status(404).json({ message: "This specified user or dish does not exist." })
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    } else if (userId) {
        res.status(404).json({ message: "Missing donation dish form id for request." });
    } else if (dishId) {
        res.status(404).json({ message: "Missing  user id for request." });
    } else {
        res.status(404).json({ message: "Missing user and donation dish form id for request." });
    }
};