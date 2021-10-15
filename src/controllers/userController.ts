import { Error } from 'mongoose';
import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';

export const updateUser = (req: Request, res: Response) => {
    const { id } = req.params;
    const { body } = req;
    User.findByIdAndUpdate(id, body).then((result: UserDocument) => {
        return res.status(201).json({
            message: 'success',
        });
    }).catch((error: Error) => {
        return res.status(400).json({
            message: error.message
        });
    });
};

/**
 * Deletes user based on id
 * @route DELETE /api/user/:id
 * @param id string specifying id of user to delete
 * @return JSON with either an error or "success"
 */
export const deleteUser = (req: Request, res: Response) => {
    const { id } = req.params;
    User.findByIdAndDelete(id).then(result => {
        return res.status(201).json({
            message: 'Success'
        });
    }).catch(error => {
        return res.status(400).json({
            message: error.message
        });
    });
};
