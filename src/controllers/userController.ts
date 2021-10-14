import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';

/**
 * Returns one User object with the matching business name
 * @route GET /user/businessName/:businessName
 * */
export const getUserByBusinessName = (req: Request, res: Response) => {
    const { businessName } = req.params;

    if (!businessName) {
        res.status(400).json({ message: 'Missing business name for request.' });
        return;
    }

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
