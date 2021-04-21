import { Response, Request } from 'express';
import { Document } from 'mongoose';
// eslint-disable-next-line camelcase
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { User } from '../models/User';
import { Donation, DonationDocument } from '../models/Donation';
import { uploadFileOrFiles } from '../util/image';
import * as userController from './userController';
import { sendBatchNotification } from '../util/notifications';
import { isAdmin } from '../util/auth';

/**
 * Gets Donors
 * @route GET /donors
 */
export const getDonors = (req: Request, res: Response) => {
    User.find({ donorInfo: { $exists: true } })
        .then(results => res.status(200).json({ donors: results }))
        .catch((error: Error) => res.status(500).json({ success: false, message: error.message }));
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
        .catch((error: Error) => res.status(400).json({ message: error.message }));
};

/**
 * Gets details of a donor based on its id
 * @route GET /donors/:donor_id
 */
export const getDonorDetails = (req: Request, res: Response) => {
    // authenticating endpoint
    const payload: unknown = jwt_decode(req.headers.authorization);
    if (!payload) {
        return res.status(400).json({ error: 'Invalid ID token' });
    }

    const id = req.params.donor_id;
    return User.find({ _id: id, donorInfo: { $exists: true } }, 'donorInfo.name donorInfo.phone donorInfo.address donorInfo.latitude donorInfo.longitude')
        .then(result => { res.status(200).json({ donor: result }); })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};

/**
 * Gets Donations
 * @route GET /donations
 */
export const getDonations = (req: Request, res: Response) => {
    Donation.find()
        .populate('donor', '_id donorInfo.name donorInfo.phone donorInfo.address donorInfo.longitude donorInfo.latitude')
        .populate('volunteer', '_id name volunteerInfo.phone')
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

    const payload: any = jwt_decode(req.headers.authorization);
    if (!payload) {
        res.status(400).json({
            error: 'Invalid ID token'
        });
        return;
    }
    User.findOne({ sub: { $eq: payload.sub } }).then(user => {
        if ('donorInfo' in user) {
            jsonBody.donor = user._id;
        } else if (!isAdmin(payload)) {
            res.status(500).json({
                message: 'User is not an admin or a donor'
            });
            return;
        }
        try {
            if ((!req.files || !req.files.descriptionImage) && !jsonBody.description) {
                res.status(400).json({
                    success: false,
                    message: "No images attached to the key 'descriptionImage', nor a description in the stringified json body.",
                });
            } else {
                jsonBody.descriptionImages = req.files?.descriptionImage ? uploadFileOrFiles(req.files.descriptionImage) : [];
                jsonBody.foodImages = req.files?.foodImage ? uploadFileOrFiles(req.files.foodImage) : [];
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
    }).catch(error => {
        res.status(500).json({
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
        'availability.startTime': { $lte: new Date() },
        'availability.endTime': { $gte: new Date() }
    })
        .populate('donor', '_id donorInfo.name donorInfo.phone donorInfo.address donorInfo.longitude donorInfo.latitude')
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
        .catch((error: Error) => res.status(400).json({ message: error.message }));
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

/**
 * Gets details of a donation based on its id
 * @route GET /donations/:donation_id
 */
export const getDonationDetails = (req: Request, res: Response) => {
    const id = req.params.donation_id;
    return Donation.findById(id)
        .populate('donor', '_id donorInfo.name donorInfo.phone donorInfo.address donorInfo.longitude donorInfo.latitude')
        .populate('volunteer', '_id name volunteerInfo.phone')
        .then(result => { return res.status(200).json({ donation: result }); })
        .catch((error: Error) => res.status(400).json({ message: error.message }));
};

/**
 * Marks a donation as reserved
 * @route POST /donations/:donation_id/reserve
 */
export const reserveDonation = (req: Request, res: Response) => {
    User.findOne({ sub: { $eq: (<JwtPayload>jwt_decode(req.headers.authorization)).sub } }).then(user => {
        const donationId = req.params.donation_id;
        const volunteerId = user.id;

        return Donation.findByIdAndUpdate(donationId, { $set: { 'pickup.reservedByVolunteerTime': new Date(Date.now()), volunteer: volunteerId } })
            .then(result => { res.status(200).json({ donation: result }); })
            .catch((error: Error) => res.status(400).json({ message: error.message }));
    });
};

/**
 * Marks a donation as picked up. The MongoDB user id of the user corresponding to the sub field of the provided JWT in the authorization header must correspond to the volunteer id of the donation (i.e., this same volunteer must have already marked it as reserved).
 * @route POST /donations/:donation_id/pick-up
 */
export const pickUp = (req: Request, res: Response) => {
    User.findOne({ sub: { $eq: (<JwtPayload>jwt_decode(req.headers.authorization)).sub } }).then(user => {
        const donationId = req.params.donation_id;
        Donation.findById(donationId).then(donation => {
            const donationVolunteer = donation.volunteer;
            const pickupVolunteer = user.id;

            // eslint-disable-next-line eqeqeq
            if (pickupVolunteer != donationVolunteer) {
                res.status(400).json({
                    success: false,
                    message: 'Pickup volunteer does not match volunteer of donation',
                });
            }

            return Donation.findByIdAndUpdate(donationId, { $set: { 'pickup.pickupTime': new Date(Date.now()), volunteer: pickupVolunteer } })
                .then(result => { res.status(200).json({ donation: result }); })
                .catch((error: Error) => res.status(400).json({ message: error.message }));
        });
    });
};

/**
 * Marks a donation as dropped off. The MongoDB user id of the user corresponding to the sub field of the provided JWT in the authorization header must correspond to the volunteer id of the donation.
 * @route POST /donations/:donation_id/drop-off
 */
export const dropOff = (req: Request, res: Response) => {
    User.findOne({ sub: { $eq: (<JwtPayload>jwt_decode(req.headers.authorization)).sub } }).then(user => {
        const donationId = req.params.donation_id;
        Donation.findById(donationId).then(donation => {
            const donationVolunteer = donation.volunteer;
            const dropoffVolunteer = user.id;

            // TODO: check that the donation has already been picked up

            // eslint-disable-next-line eqeqeq
            if (dropoffVolunteer != donationVolunteer) {
                res.status(400).json({
                    success: false,
                    message: 'Dropoff volunteer does not match volunteer of donation',
                });
            }

            return Donation.findByIdAndUpdate(donationId, { $set: { 'pickup.dropoffTime': new Date(Date.now()), volunteer: dropoffVolunteer } })
                .then(result => { res.status(200).json({ donation: result }); })
                .catch((error: Error) => res.status(400).json({ message: error.message }));
        });
    });
};

/**
 * Marks a donation as donor confirmed
 * @route POST /donations/:donation_id/donor-confirm
 */
export const confirmDonation = (req: Request, res: Response) => {
    User.findOne({ sub: { $eq: (<JwtPayload>jwt_decode(req.headers.authorization)).sub } }).then(user => {
        const donationId = req.params.donation_id;
        const donationDonor = req.params.donor_id;
        const donorId = user.id;

        if (donorId !== donationDonor) {
            res.status(400).json({
                success: false,
                message: 'Current donor id does not match the donor of the donation',
            });
        }

        return Donation.findByIdAndUpdate(donationId, { $set: { 'pickup.donorConfirmationTime': new Date(Date.now()) } })
            .then(result => { res.status(200).json({ donation: result }); })
            .catch((error: Error) => res.status(400).json({ message: error.message }));
    });
};
