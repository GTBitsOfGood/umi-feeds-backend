import { Error } from 'mongoose';

import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';
/*
import bcrypt from 'bcryptjs';
import Password from '../models/Password' */

/**
 * POST: Gets User Information based on access token
 * TODO: Authentication Required (since this endpoint gives out user information!!!)
 * @route POST /login/:accesstoken
 */
export const postLoginUser = (req: Request, res: Response) => {
    // If there is no access token then we are not going to be able to query the db for the user information
    if (req.params === undefined || req.params === null || req.params.accesstoken === undefined || req.params.accesstoken === null) {
        res.status(400).json({ message: 'No access token provided to query the user by', user: {} });
        return;
    }

    // Query the users in the db based on the auth0AccessToken
    User.findOne({ auth0AccessToken: req.params.accesstoken }, (err:Error, user:UserDocument) => {
        // If there was an error report code 400 to the client
        if (err) {
            res.status(400).json({ message: err.message, user });
            return;
        }
        // If no user was found then report code 303 indicating the user should be redirected to onboarding
        if (user === null) {
            res.status(303).json({ message: 'Could not find user in db', user });
            return;
        }
        // Successfully found the user information based on the auth0token
        res.status(200).json({ message: 'success', user });
    });
};

/*
// Checks volunteer
export const checkVolunteer = (req: Request, res: Response) => {
    const password = req.params.userpasscode;
    // Check database for password
    Password.findOne({type: "Volunteer"}).then(result) => {
        const hashedPassword = result[0].password;
    }.catch(err: Error) {
        res.send(400).json({ message: err.message })
    }

    // Compare password
    if (!hashedPassword) {
        res.send(400).json({ message: err.message })
    }
    bcrypt.compare(password, hashedPassword).then(isMatch)  => {
        if (!isMatch) {
            res.send(400).json({ message: 'match'});
        } else {
            res.send(200).json({ message: 'match'});
        }
      }).catch(err: Error) {
        res.send(400).json({ message: err.message })
      }
} */

/*
// Add password to DB
export const addVolunteerPW = (req: Request, res: Response)  => {
    var newPassword = new Password({
        type: "Volunteer"
      });

      const password = req.params.password;
      let hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      newPassword.password = hashedPassword;
      newPassword.save();
});
*/
