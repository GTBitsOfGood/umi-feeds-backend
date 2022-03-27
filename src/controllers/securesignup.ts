import { Error } from 'mongoose';

import { Response, Request } from 'express';
import { SecureSignup } from '../models/SecureSignup';

/**
 * GET Returns whether user supplied passcode matches one give in the database
 */
export const validatePasscode = async (req: Request, res: Response) => {
    if (req.params === undefined || req.params === null || !req.params.userpasscode) {
        res.status(400).json({ message: 'no match' });
        return;
    }

    const result = await SecureSignup.findOne({ passcode: req.params.userpasscode }).exec();

    if (!result) {
        res.status(400).json({ message: 'no match' });
    } else {
        res.status(200).json({ message: 'match' });
    }
};
