import { Response, Request } from 'express';
// eslint-disable-next-line camelcase
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { User } from '../models/User';

type UserType = 'donor' | 'volunteer' | 'recipient' | 'admin' | 'any';

/**
 * Query user based on type
 * @param userType string specifying userType either 'donor', 'volunteer', 'recipient', 'admin', or 'any'
 */
const queryOnUserType = (userType: UserType) => {
    if (userType === 'donor') {
        return User.find({ donorInfo: { $exists: true } });
    }
    if (userType === 'volunteer') {
        return User.find({ volunteerInfo: { $exists: true } });
    }
    if (userType === 'recipient') {
        return User.find({ recipient: { $eq: true } });
    }
    if (userType === 'admin') {
        return User.find({ admin: { $eq: true } });
    }
    if (userType === 'any') {
        return User.find({});
    }
    throw new Error(`Invalid user type: ${userType}`);
};

/**
 * Gets push tokens based on user type
 * @param userType string specifying userType either 'donor', 'volunteer', 'recipient', 'admin', or 'any'
 */
export const getPushTokens = (userType: UserType) => {
    return new Promise((resolve, reject) => {
        queryOnUserType(userType).select('pushTokens').then(result => {
            const tokens: string[] = [];
            result.forEach((userDoc) => {
                for (let i = 0; i < userDoc.pushTokens.length; i++) {
                    tokens.push(userDoc.pushTokens[i]);
                }
            });
            resolve(tokens);
        }).catch(error => {
            reject(error);
        });
    });
};

/**
 * Gets User Push Tokens
 * @route GET /tokens
 */
export const getTokens = (req: Request, res: Response) => {
    getPushTokens('any')
        .then(result => {
            return res.status(201).json({
                tokens: result
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            });
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

/**
 * Posts Token to add token to User
 * @route POST /token
 */
export const postToken = (req: Request, res: Response) => {
    User.findOne({ sub: { $eq: (<JwtPayload>jwt_decode(req.headers.authorization)).sub } }).then(user => {
        const tokens = user.pushTokens;
        let hasToken = false;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === req.body.token) {
                hasToken = true;
                break;
            }
        }
        if (!hasToken && req.body.token !== '') {
            tokens.push(req.body.token);
        }
        user.save().then(result => {
            return res.status(201).json({
                status: 'success',
            });
        }).catch(error => {
            return res.status(500).json({
                message: error.message
            });
        });
    }).catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};
