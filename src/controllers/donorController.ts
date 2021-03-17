import { Response, Request } from 'express';
import { Document } from 'mongoose';
import { Donor } from '../models/Donor';
import { User } from '../models/User';
import { Donation, DonationDocument } from '../models/Donation';
import { uploadFileOrFiles } from '../util/image';
import * as userController from './userController';
import { sendBatchNotification } from '../util/notifications';

/**
 * Gets Donors
 * @route GET /donors
 */
export const getDonors = (req: Request, res: Response) => {
    User.find({donorInfo : { $exists: true }})
        .then(results => res.status(200).json({ donors: results }));
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
    const id = req.params.donor_id;
    return User.findByIdAndUpdate(id, req.body)
        .then(result => { 
            return res.status(200).json({ 
                donor: result 
            });
        })
        .catch((error: Error) => 
            res.status(400).json({ message: error.message })
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
 * Creates a new donation, and then then notifies admins about this new donation.
 * @route POST /donations
 * Request body:
 * @param {string} req.body.json Stringified JSON of type DonationDocument (see Donation.ts). descriptionImages and foodImages can be omitted as they default to an empty array in Mongoose. Example: '{"donor":"602bf82713e73d625cc0d522","availability":{"startTime":"2021-03-16T07:59:48.476Z","endTime":"2021-03-17T07:59:48.476Z"}}'
 * @param {UploadedFile? | Array<UploadedFile>?} req.files.descriptionImage Images of a description of the food. Having either this or the "description" key in `req.body.json` is mandatory.
 * @param {UploadedFile? | Array<UploadedFile>?} req.files.foodImage Images of the food. Optional.
 * In Postman, you would make a request with Body set to form-data. The descriptionImage or foodImage key would be of the File type, and then you'd have a json key with the type set to Text.
 */
export const postDonations = (req: Request, res: Response) => {
    const jsonBody: Omit<DonationDocument, keyof Document> & { descriptionImages?: string[], foodImages?: string[] } = JSON.parse(req.body.json);
    try {
        if ((!req.files || !req.files.descriptionImage) && !jsonBody.description) {
            res.status(400).json({
                success: false,
                message: "No images attached to the key 'descriptionImage', nor a description in the stringified json body.",
            });
        } else {
            jsonBody.descriptionImages = req.files.descriptionImage ? uploadFileOrFiles(req.files.descriptionImage) : [];
            jsonBody.foodImages = req.files.foodImage ? uploadFileOrFiles(req.files.foodImage) : [];
            const donation = new Donation(jsonBody);
            donation.save()
                .then(result => {
                    res.status(201).json({
                        donation: result
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        message: error.message
                    });
                });

            // Notify admins about the new donation
            User.findById(jsonBody.donor).then(result => {
                userController.getPushTokens('admin').then((tokens: string[]) => {
                    sendBatchNotification(`New donation from ${result.name}!`, jsonBody.description, tokens);
                });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Query Donations available to pickup
 * @route GET /available-pickup
 */

export const availPickup = (req: Request, res: Response) => {
    Donation.find({
        'availability.startTime': { $lte: new Date() },
        'availability.endTime': { $gte: new Date() }
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
        .catch((error: Error) => res.status(400).json({ success: false, message: error.message }));
};

/**
 * Modifies Donations
 * @route PUT /donations/:donation_id
 */
export const modifyDonation = (req: Request, res: Response) => {
    const id = req.params.donation_id;
    return Donation.findByIdAndUpdate(id, req.body)
        .then(result => { 
            return res.status(200).json({ 
                donation: result 
            });
        })
        .catch((error: Error) => 
            res.status(400).json({ message: error.message })
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
        .catch((error: Error) => res.status(400).json({ success: false, message: error.message }));
};
