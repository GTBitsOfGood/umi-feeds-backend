import { Response, Request } from 'express';
// eslint-disable-next-line camelcase
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { User } from '../models/User';

export const postUserSignUp = (req: Request, res: Response) => {
    const user = new User(req.body);
    return user.save()
        .then(result => {
            return res.status(201).json({
                user: result
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            });
        });
};
