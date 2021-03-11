import { Response, Request, NextFunction } from 'express';
import { Donor } from '../models/Donor';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import * as userController from './userController';
import {sendBatchNotification} from '../util/notifications';

/**
 * Gets Donors
 * @route GET /donors
 */
export const getDonors = (req: Request, res: Response) => {
    User.find({donorInfo : { $exists: true }})
    .then(results => {
        return res.status(200).json({
            donor: results,
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Posts Donors
 * @route POST /donors
 */
export const postDonors = (req: Request, res: Response) => {
    const donor = new User(req.body);
    return donor.save()
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
 * Modifies Donors
 * @route PUT /donors/:donor_id
 */
export const modifyDonor = (req: Request, res: Response) => {
    const id = req.params.donor;
    const updatedDonor = req.params;
    return Donor.findByIdAndUpdate(id, updatedDonor)
        .then(result => res.status(200).json({ success: true }))
        .catch((error: Error) => 
            res.status(400).json({ success: false, message: error.message })
        );
};

/**
 * Gets Donations
 * @route GET /donations
 */
export const getDonations = (req: Request, res: Response) => {
    Donation.find().populate('donor', '_id name latitude longitude')
    .then(results => {
        return res.status(200).json({
            donations: results,
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Posts Donations
 * @route POST /donations
 */
export const postDonations = (req: Request, res: Response) => {
    const donation = new Donation(req.body);
    User.findById(req.body.donor).then((result => {
        userController.getPushTokens('admin').then((tokens: string[]) => {
            sendBatchNotification('New donation from ' + result.name + '!', req.body['description'], tokens);
        });
    }));
    return donation.save()
    .then(result => {
        return res.status(201).json({
            donation: result
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Query Donations available to pickup
 * @route GET /available-pickup
 */

export const availPickup = (req: Request, res: Response) => {
    Donation.find({
        'availability.startTime' : { '$lte' : new Date() },
        'availability.endTime' : { '$gte' : new Date() }
    })
    .populate('donor', '_id name latitude longitude')
    .then(result => {
        return res.status(200).json({
            donation: result
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Deletes Donations
 * @route DELETE /donations/:donation_id
 */
export const deleteDonation = (req: Request, res: Response) => {
    const id = req.params.donation_id;
    return Donation.findByIdAndDelete(id)
        .then(result => res.status(200).json({ success: true, deleted: result }))
        .catch((error: Error) =>
            res.status(400).json({ success: false, message: error.message })
        );
};

/**
 * Modifies Donations
 * @route PUT /donations/:donation_id
 */
export const modifyDonation = (req: Request, res: Response) => {
    const id = req.params.donation_id;
    const updatedDonation = req.params;
    return Donation.findByIdAndUpdate(id, updatedDonation)
        .then(result => res.status(200).json({ success: true }))
        .catch((error: Error) => 
            res.status(400).json({ success: false, message: error.message })
        );
};

/**
 * Queries donations made by User
 * @route GET /donors/:donor_id/donations
 */
 export const userDonations = (req: Request, res: Response) => {
     const id = req.params.donor_id;
     return Donation.find({ donor: id })
        .then(result => res.status(200).json({ success: true, donations: result }))
        .catch((error: Error) =>
            res.status(400).json({ success: false, message: error.message })
        );
 };
