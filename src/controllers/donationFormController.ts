import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { url } from 'inspector';
import { User, UserDocument } from '../models/User/index';
import { deleteImageAzure, uploadImageAzure } from '../util/azure-image';
import { OngoingDonation, OngoingDonationDocument } from '../models/User/DonationForms';
import { sendBatchNotification, sendPushNotifications } from '../util/notifications';
/**
 * Gets Donation Forms by User
 * @route GET /api/donationform?id={userid}&donationFormID={formid}
 */
export const getDonationForms = (req: Request, res: Response) => {
    const userid = req.query.id || null;
    const formid = req.query.donationFormID || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid === null) {
        res.status(400).json({ message: 'No user id specified in request' });
        return;
    }

    // We can find a single user by using the userid
    User.findById(userid)
        .then((results: UserDocument) => {
            // If the formid wasn't specified just return all of the donation forms
            if (formid === null) {
                res.status(200).json({ message: 'Success', donationforms: results.donations });
            } else {
                // Since the formid was specified we need to loop through and find the donation form with the matching id
                for (const donation of results.donations) {
                    if (donation._id.toString() === formid) {
                        res.status(200).json({ message: 'Success', donationform: donation });
                        return;
                    }
                }
                // If none of the donation forms had the matching id then we need to report an error
                res.status(400).json({ message: `Could not find donations form ${formid} for user ${userid}`, donationforms: [] });
            }
        })
        .catch((error: mongoose.Error) => res.status(400).json({ message: error.message, donationforms: [] }));
};

/**
 * Gets Ongoing Donation Forms by User
 * @route GET /api/donationform/ongoing?id={userid}
 */
export const getOngoingDonationForms = (req: Request, res: Response) => {
    const userid = req.query.id || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request' });
        return;
    }

    // We can find a single user by using the userid
    User.findById(userid)
        .then((results: UserDocument) => {
            const donations = [];
            // Loop through and find all ongoing donations
            for (const donation of results.donations) {
                if (donation.ongoing) {
                    donations.push(donation);
                }
            }
            res.status(200).json({ message: 'Success', donationforms: donations });
        })
        .catch((error: mongoose.Error) => res.status(400).json({ message: error.message, donationforms: [] }));
};

/**
 * Posts Donation Form to Users Donation Forms
 * @route POST /api/donationform?id={userid}
 */
export const postDonationForm = async (req: Request, res: Response) => {
    const userid = req.query.id || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request', donationform: {} });
        return;
    }

    // req.body.data should hold the donationform information to save to the user
    if (req.body === undefined || req.body === null || req.body.data === undefined) {
        res.status(400).json({ message: 'No data about donation provided with key \'data\'', donationform: {} });
        return;
    }

    // Set up transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // UploadImage and Query User simultaneously by creating a promise out of both asynchronous tasks
        const [url, currentUser] = await Promise.all(
            [
                // If we have a file to upload call uploadImageAzure otherwise just use the default image url
                (req.files !== null && req.files !== undefined && req.files.image !== undefined
                    ? uploadImageAzure(req.files.image as UploadedFile) : ''),
                User.findById(userid).session(session)
            ]
        );

        if (!currentUser) {
            throw new Error('User does not exist.');
        }

        // Processing JSON data payload
        const newDonationForm = JSON.parse(req.body.data);
        newDonationForm.imageLink = url;

        // Adding new donation to specified user
        currentUser.donations.push(newDonationForm);
        const savedDonation = await currentUser.save()
            .then((updatedUser: UserDocument) => {
                const donationId = updatedUser.donations[updatedUser.donations.length - 1]._id;
                newDonationForm._id = donationId;
                return updatedUser;
            });

        if (!savedDonation) {
            throw new Error('Failed to Save Donation');
        }

        // Send a push notification to all the admins notifying them of the new donation
        User.find({ isAdmin: true }).select('pushTokens').exec((err, users) => {
            if (err) {
                throw err;
            }
            let tokens:string[] = [];
            // Collect the tokens of all the admins
            for (const user of users) {
                tokens = tokens.concat(user.pushTokens);
            }
            console.log('sending notification');
            sendBatchNotification(`New Donation from ${currentUser.businessName}`,
                req.body.description ?? 'Check app for details',
                tokens);
        });

        // Adds donation to OngoingDonations queue
        newDonationForm.userID = userid;

        const savedOngoing = await OngoingDonation.create([newDonationForm], { session });

        if (!savedOngoing) {
            throw new Error('Failed to Save Donation');
        }

        // Commit transaction and sending success response if saved into DB
        await session.commitTransaction();
        res.status(200).json({
            message: 'Success',
            donationform: savedDonation.donations[savedDonation.donations.length - 1]
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({
            message: err.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * Updates Donation Form fields based on provided data
 * @route PUT /api/donationform?id={userid}&donationFormID={formid}
 */
export const putDonationForm = async (req: Request, res: Response) => {
    const userid = req.query.id || null;
    const formid = req.query.donationFormID || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request', donationform: {} });
        return;
    }

    // We need a formid to location the specific donation form to update
    if (formid == null) {
        res.status(400).json({ message: 'No form id specified in request', donationform: {} });
        return;
    }

    // Checck if modified data exists in body
    if (req.body === undefined && req.body === null && req.body.data === undefined) {
        res.status(400).json({ message: 'No data about dish attached to key "data".', donationform: {} });
        return;
    }

    // Set up transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if specified donation and specified User exists
        const [ongoingDonation, currentUser] = await Promise.all(
            [
                OngoingDonation.findById(formid),
                User.findById(userid).session(session)
            ]
        );

        if (!ongoingDonation) {
            throw new Error('Specified donation does not exist.');
        }

        if (!currentUser) {
            throw new Error('Specified user does not exist.');
        }

        // Upload new image to Azure if necessary
        let newImageUrl:string;
        if (req.files !== null && req.files !== undefined && req.files.image !== undefined) {
            newImageUrl = await uploadImageAzure(req.files.image as UploadedFile);
        } else {
            newImageUrl = '';
        }

        // Processing JSON data payload
        const newDonationForm = JSON.parse(req.body.data);
        if (newImageUrl) {
            newDonationForm.imageLink = newImageUrl;
        }

        // Update specified donation as a part of User's donations array
        let oldImageUrl = '';
        for (const donation of currentUser.donations) {
            if (donation._id.toString() === formid) {
                oldImageUrl = donation.imageLink;
                for (const [key, value] of Object.entries(newDonationForm)) {
                    // Replace all of the old values in the donationform
                    // @ts-ignore Key is always a string, but Typescript finds that confusing
                    donation[key] = value;
                }
            }
        }

        // Deletes old image from Azure if a new image is updated for donation
        if (oldImageUrl && newImageUrl) {
            const deleteResponse = await deleteImageAzure(oldImageUrl);
        }

        // Saves updated donation to User donation array
        const updatedDonation:UserDocument = await currentUser.save();
        if (!updatedDonation) {
            throw new Error('Failed to update donation for specified user');
        }

        // Update specified donation in Ongoing Donation Queue
        delete newDonationForm.imageLink;
        const updatedOngoing = await OngoingDonation.findByIdAndUpdate(formid, newDonationForm, { new: true }).session(session);
        if (!updatedOngoing) {
            throw new Error('Failed to update Ongoing Donation for specified user.');
        }

        // Commit transaction once updated in both collections
        await session.commitTransaction();
        res.status(200).json({
            message: 'Success',
            donationform: updatedDonation.donations[updatedDonation.donations.length - 1]
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({
            message: err.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * Deletes donation form from user and removes it from azure blob storage
 * @route DELETE /api/donationform?id={userid}&donationFormID={formid}
 */
export const deleteDonationForm = (req: Request, res: Response) => {
    const userid = req.query.id || null;
    const formid = req.query.donationFormID || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request', donationform: {} });
        return;
    }

    // We need a formid to location the specific donation form to delete
    if (formid == null) {
        res.status(400).json({ message: 'No form id specified in request', donationform: {} });
        return;
    }

    // Find the user by using the specified userid
    User.findById(userid).then((result) => {
        // We need to loop through and find the donation form with the matching id
        for (const [i, donation] of result.donations.entries()) {
            if (donation._id.toString() === formid) {
                // cut the donationform out of the users donations and delete the image from azure
                result.donations.splice(i, 1);
                deleteImageAzure(donation.imageLink).then(() => {
                    result.save().then(() => {
                        res.status(200).json({ message: 'Success', donationform: donation });
                    }).catch((err: mongoose.Error) => {
                        res.status(400).json({ message: err.message, donationform: donation });
                    });
                }).catch((err: mongoose.Error) => {
                    res.status(400).json({ message: err.message, donationform: donation });
                });
                return;
            }
        }
        // If we looped through all of the users donations and couldn't find a matching donation form return error
        res.status(400).json({ message: `Could not find donation form with id ${formid} for user ${userid}`, donationform: {} });
    }).catch((err: mongoose.Error) => {
        res.status(400).json({ message: err.message, donationform: {} });
    });
};
