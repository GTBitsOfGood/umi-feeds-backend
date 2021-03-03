import { Response, Request, NextFunction } from 'express';
import { User } from '../models/User';
import {Donor} from "../models/Donor";

/**
 * Query user based on type
 * @param userType string specifying userType either 'donor', 'volunteer', 'recipient', 'admin', or 'any'
 */
const queryOnUserType = (userType: string) => {
    if (userType == 'donor') {
        return User.find({donorInfo:{$exists: true}});
    }
    if (userType == 'volunteer') {
        return User.find({volunteerInfo:{$exists: true}});
    }
    if (userType == 'recipient') {
        return User.find({recipient:{$eq: true}});
    }
    if (userType == 'admin') {
        return User.find({admin:{$eq: true}});
    }
    if (userType == 'any') {
        return User.find({});
    }
    // This line would avoid errors if there is a typo, but it kinda seems like a
    // security vulnerability so I'll leave it commented

    // return User.find({});
};

/**
 * Gets push tokens based on user type
 * @param userType string specifying userType either 'donor', 'volunteer', 'recipient', 'admin', or 'any'
 */
export const getPushTokens = (userType: string) => {
    queryOnUserType(userType).select('pushTokens').then(result => {
        console.log(result);
        return result;
    });
};

/**
 * Gets Donations
 * @route GET /donors
 */
export const getTokens = (req: Request, res: Response) => {
    const tokens = getPushTokens('donor');
    return res.status(200).json({
        tokens: tokens,
    });
};


/**
 * Posts Users
 * @route POST /users
 */
export const postUsers = (req: Request, res: Response) => {
    const user = new User(req.body);
    return user.save()
        .then(result => {
            return res.status(201).json({
                donor: result
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            });
        });
};
