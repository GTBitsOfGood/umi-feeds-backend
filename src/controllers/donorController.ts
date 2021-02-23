import { Response, Request, NextFunction } from 'express';
import { Donor } from '../models/Donor';
import { Donation } from '../models/Donation';

/**
 * Gets Donations
 * @route GET /donors
 */
export const getDonors = (req: Request, res: Response) => {
    Donor.find()
    .then(results => {
        return res.status(200).json({
            donors: results,
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
    const donor = new Donor(req.body);
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
 * Gets Donations
 * @route GET /donations
 */
export const getDonations = (req: Request, res: Response) => {
    Donation.find()
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
 * Upload Images for Donations
 * @route PUT /donations/images
 */

 export const uploadImageDonations = (req: Request, res: Response) => {
     // Upload Image code
     const id = req.body.id;
     Donation.updateOne({_id: id}, {
         descriptionImages: [],
         foodImages: []
     }).then(result => {
         res.status(200).json({
             donation: result
         })
     }).catch(error => {
         res.status(500).json({
             message: error.message
         })
     })
 }


/**
 * Query Donations available to pickup
 * @route GET /available-pickup
 */

export const availPickup = (req: Request, res: Response) => {
    Donation.find({ 
        'availability.startTime' : { '$lte' : new Date() },  
        'availability.endTime' : { '$gte' : new Date() }
    })
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


