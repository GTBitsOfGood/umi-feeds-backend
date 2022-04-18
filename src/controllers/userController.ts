import { Error } from 'mongoose';
import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';

/**
 * Returns one User object with the matching business name
 * @route GET /user/businessName/:businessName
 * */
export const getUserByBusinessName = (req: Request, res: Response) => {
    // businessName should never be null because it is a path variable
    const { businessName } = req.params;

    User.findOne({ businessName })
        .then((result: UserDocument) => {
            res.status(200).json({ message: 'Success', user: result });
        })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};

/**
 * Returns an array of User object with their roles array containing any of the matching boolean strings in the string params
 * @route GET /user/roles?donor=<booleanString>&volunteer=<booleanString>&recipent=<booleanString>
 * */
export const getUsersByRoles = (req: Request, res: Response) => {
    const { donor } = req.query;
    const { volunteer } = req.query;
    const { recipient } = req.query;

    if (!donor) {
        res.status(400).json({ message: 'Missing donor field.' });
        return;
    }
    if (!volunteer) {
        res.status(400).json({ message: 'Missing volunteer field.' });
        return;
    }
    if (!recipient) {
        res.status(400).json({ message: 'Missing recipient field.' });
        return;
    }

    const roles: string[] = [];
    if (donor === '1') {
        roles.push('donor');
    }
    if (volunteer === '1') {
        roles.push('volunteer');
    }
    if (recipient === '1') {
        roles.push('recipient');
    }

    User.find({ roles: { $all: roles } })
        .then((result: UserDocument[]) => {
            res.status(200).json({ message: 'Success', users: result });
        })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};

/**
 * Adds a pickup address to the user object
 * @route POST /user/address/:id
 */
export const addPickupAddress = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { body } = req;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { $push: { pickupAddresses: body } }, { new: true });
        res.status(200).send(updatedUser);
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: `Error: ${e.message}`
        });
    }
};

/**
 * Updates an existing pickup address
 * @route PUT /user/address/:id with the body the edited address including the id
 */
export const editPickupAddress = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { body } = req;
    console.log(body);
    try {
        const oldUser = await User.findById(userId);
        const newPickupAddresses = oldUser.pickupAddresses.map(address => {
            if (address._id.toString() === req.body._id.toString()) {
                return body;
            }
            return address;
        });
        const updatedUser = await User.findByIdAndUpdate(userId, { pickupAddresses: newPickupAddresses }, { new: true });
        res.status(200).send(updatedUser);
    } catch (e) {
        res.status(500).send({
            message: `Error: ${e.message}`
        });
    }
};

/**
 * Deletes a pickup address
 * @route DELETE /user/address/:id?addressId=<string> with the addressId of the address to delete
 */
export const deletePickupAddress = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { addressId } = req.query;

    try {
        const user = await User.findById(userId);
        const newPickupAddresses = user.pickupAddresses.filter(a => {
            return a._id.toString() !== addressId.toString();
        });
        const newUser = await user.update({
            pickupAddresses: newPickupAddresses
        });
        res.status(200).send(newUser);
    } catch (e) {
        res.status(500).send({
            message: `Error: ${e.message}`
        });
    }
};

/**
 * Updates a user to a new user object sent in the body of the request
 * @route PUT /user/:id
 */
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
