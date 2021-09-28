import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { User, UserDocument } from '../models/User/index';
import { uploadImageAzure, deleteImageAzure } from '../util/azure-image';

/**
 * Gets Dishes based on User Id and get Dish by User id and Dish Id
 * @route GET /dishes?id=<string>
 * @route GET /dishes?id=<string>&dishID=<string>
 *
 * */
export const getDish = (req: Request, res: Response) => {
    const userId = req.query.id;
    const dishId = req.query.dishID;

    if (userId && dishId) {
        return User.findOne({ _id: userId, 'dishes._id': dishId }, { _id: 0, dishes: { $elemMatch: { _id: dishId } } })
            .then((result: UserDocument) => {
                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(400).json({ message: 'The specified user or dish does not exist.' });
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    } else if (userId) {
        return User.findOne({ _id: userId, dishes: { $exists: true } }, { _id: 0, dishes: 1 })
            .then((result: UserDocument) => {
                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(400).json({ message: 'The specified user does not exist.' });
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    } else {
        return res.status(400).json({ message: 'Missing user id or dish id for request.' });
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
        res.status(400).json({ message: 'Missing user id for request.' });
        return;
    }

    if (!req.files.dishImage) {
        res.status(400).json({ message: 'No image attached to key "dishImage" for dish.' });
        return;
    }

    if (!req.body.json) {
        res.status(400).json({ message: 'No data about dish attached to key "json".' });
        return;
    }

    if (!req.body.json && !req.files.dishImage) {
        res.status(400).json({ message: 'No data about dish attached to key "json" and no image attached to key "dishImage".' });
        return;
    }

    Promise.resolve(uploadImageAzure(req.files.dishImage as UploadedFile))
        .then((url: string) => {
            const dishBody = JSON.parse(req.body.json);
            dishBody._id = mongoose.Types.ObjectId();
            dishBody.imageLink = url;

            return User.updateOne({ _id: userId }, { $push: { dishes: dishBody } })
                .then((result: mongoose.UpdateWriteOpResult) => {
                    if (result.nModified !== 0) {
                        res.status(201).json({ message: 'Success' });
                    } else {
                        res.status(404).json({ message: 'The specified user does not exist.' });
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
        res.status(400).json({ message: 'Missing user id for request.' });
        return;
    }

    if (!dishId) {
        res.status(400).json({ message: 'Missing dish id for request.' });
        return;
    }

    if (!req.files.dishImage) {
        res.status(400).json({ message: 'No image attached to key "dishImage" for dish.' });
        return;
    }

    if (!req.body.json) {
        res.status(400).json({ message: 'No data about dish attached to key "json".' });
        return;
    }

    if (!req.body.json && !req.files.dishImage) {
        res.status(400).json({ message: 'No data about dish attached to key "json" and no image attached to key "dishImage".' });
        return;
    }

    // Removes old image
    User.findOne({ _id: userId, 'dishes._id': dishId }, { _id: 0, dishes: { $elemMatch: { _id: dishId } } })
        .then((result: UserDocument) => {
            const oldImageUrl:string = result.dishes[0].imageLink;
            deleteImageAzure(oldImageUrl)
                .catch((err: Error) => {
                    res.status(400).json({ message: err.message });
                });
        }).catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });

    Promise.resolve(uploadImageAzure(req.files.dishImage as UploadedFile)).then((url: string) => {
        const dishBody = JSON.parse(req.body.json);
        dishBody._id = dishId;
        dishBody.imageLink = url;

        return User.updateOne({ _id: userId, 'dishes._id': dishId }, { $set: { 'dishes.$': dishBody } })
            .then((result: mongoose.UpdateWriteOpResult) => {
                if (result.nModified === 1) {
                    res.status(201).json({ message: 'Success' });
                } else {
                    res.status(404).json({ message: 'The specified user or dish does not exist.' });
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
        // Removes old image
        User.findOne({ _id: userId, 'dishes._id': dishId }, { _id: 0, dishes: { $elemMatch: { _id: dishId } } })
            .then((result: UserDocument) => {
                const oldImageUrl:string = result.dishes[0].imageLink;
                deleteImageAzure(oldImageUrl)
                    .catch((err: Error) => {
                        res.status(400).json({ message: err.message });
                    });
            }).catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });

        return User.updateOne({ _id: userId, 'dishes._id': dishId }, { $pull: { dishes: { _id: dishId } } })
            .then((result: mongoose.UpdateWriteOpResult) => {
                if (result.nModified === 1) {
                    res.status(200).json({ message: 'Success' });
                } else {
                    res.status(404).json({ message: 'This specified user or dish does not exist.' });
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    } else if (userId) {
        return res.status(400).json({ message: 'Missing donation dish form id for request.' });
    } else if (dishId) {
        return res.status(400).json({ message: 'Missing  user id for request.' });
    } else {
        return res.status(400).json({ message: 'Missing user and donation dish form id for request.' });
    }
};
