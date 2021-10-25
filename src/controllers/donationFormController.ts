import mongoose, { Error } from 'mongoose';
import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';
import { deleteImageAzure, uploadImageAzure } from '../util/azure-image';
import { OngoingDonation } from '../models/User/DonationForms';

/**
 * Gets Donation Forms by User
 * @route GET /api/donationform?id={userid}[&donationFormID={formid}]
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
        .catch((error: Error) => res.status(400).json({ message: error.message, donationforms: [] }));
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
        .catch((error: Error) => res.status(400).json({ message: error.message, donationforms: [] }));
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

    // req.files.image should hold the uploaded image to forward to Azure
    /*
    if (req.files === undefined || req.files === null || req.files.image === undefined) {
        res.status(400).json({ message: 'No image included with key \'image\'', donationform: {} });
        return;
    } */

    // req.body.data should hold the donationform information to save to the user
    if (req.body === undefined || req.body === null || req.body.data === undefined) {
        res.status(400).json({ message: 'No data about donation provided with key \'data\'', donationform: {} });
        return;
    }

    // Set up transaction session
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        // UploadImage and Query User simultaneously by creating a promise out of both asynchronous tasks
        Promise.all(
            [
                // @ts-ignore Typescript worries req.files could be an UploadedFile, but it is always an object of UploadedFiles
                uploadImageAzure(req.files.image),
                User.findById(userid).session(session)
            ]
        ).then(async (values) => {
            try {
                // Parse the 'data' from the request body to get the new donation form
                const newDonationForm = JSON.parse(req.body.data);

                console.log(values);
                let currentUser;
                [newDonationForm.imageLink, currentUser] = values; // values is [imagelink, currentuser]

                currentUser.donations.push(newDonationForm);
                await currentUser.save()
                    .then((updatedUser: UserDocument) => {
                        const donationId = updatedUser.donations[updatedUser.donations.length - 1]._id;
                        newDonationForm._id = donationId;
                        /*
                        res.status(200).json({
                            message: 'Success',
                            donationform: updatedUser.donations[updatedUser.donations.length - 1]
                        }); */
                    }).catch((err: Error) => {
                        res.status(500).json({ message: err.message, donationform: {} });
                    });
                
                //throw Error;
                // Adds entry to OngoingDonations
                //const ongoingDonation = new OngoingDonation(newDonationForm);
                await OngoingDonation.create(newDonationForm,  { session: session })
                .catch((err: Error) => {
                    res.status(500).json({ message: err.message });
                });
                /*
                await ongoingDonation.save()
                    .catch((err: Error) => {
                        res.status(500).json({ message: err.message });
                    }); */

            } catch (err) {
                res.status(400).json({ message: err.message, donationform: {} });
            }
        }).catch((error: Error) => res.status(400).json({ message: error.message, donationform: {} }))
        //await session.commitTransaction();
        console.log("done");
        /*
        res.status(200).json({
            message: 'Success'
        }); */
    } catch (err) {
        //await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    } 
};

/**
 * Updates Donation Form fields based on provided data
 * @route PUT /api/donationform?id={userid}&donationFormID={formid}
 */
export const putDonationForm = (req: Request, res: Response) => {
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

    // Find user by the specified userid
    User.findById(userid).then(async (user) => {
        // We need to loop through and find the donation form with the matching id
        for (const donation of user.donations) {
            if (donation._id.toString() === formid) {
                // req.body.data should hold the donationform information to save to the user if it is being updated
                if (req.body !== undefined && req.body !== null && req.body.data !== undefined) {
                    try {
                        // Parse the JSON for the replacement values from the 'data' field of the request
                        const replacementData = JSON.parse(req.body.data);
                        for (const [key, value] of Object.entries(replacementData)) {
                            if (key === 'imageLink') {
                                continue;
                            }
                            // Replace all of the old values in the donationform
                            // @ts-ignore Key is always a string, but Typescript finds that confusing
                            donation[key] = value;
                        }
                    } catch (err) {
                        res.status(400).json({ message: err.message, donationform: {} });
                        return;
                    }
                }
                let oldImageUrl:string = null;
                // req.files.image should hold the uploaded image to forward to Azure if the image will be replaced
                if (req.files !== undefined && req.files !== null && req.files.image !== undefined) {
                    try {
                        // @ts-ignore Typescript worries req.files could be an UploadedFile, but it is always an object of UploadedFiles
                        // This await will only run once because the loop returns in this if statement
                        // eslint-disable-next-line no-await-in-loop
                        const newImageUrl = await uploadImageAzure(req.files.image);

                        // Store the old image url to be deleted if everything else works.  Otherwise we don't want to
                        //   delete it because it will still be the url for the image if the replacement doesn't happen
                        oldImageUrl = donation.imageLink;
                        donation.imageLink = newImageUrl;
                    } catch (err) {
                        res.status(400).json({ message: err.message, donationform: {} });
                        return;
                    }
                }
                // Save the updated donation form to the database
                user.save().then(() => {
                    // If we replaced the image then we have to delete the image in azure for a full cleanup
                    if (oldImageUrl !== null) {
                        deleteImageAzure(oldImageUrl).then(() => {
                            res.status(200).json({ message: 'Success', donationform: donation });
                        }).catch((err:Error) => {
                            res.status(400).json({ message: err.message, donationform: donation });
                        });
                    } else {
                        res.status(200).json({ message: 'Success', donationform: donation });
                    }
                }).catch((err:Error) => {
                    res.status(500).json({ message: err.message, donationform: donation });
                });
                return;
            }
        }
    });
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
                    }).catch((err:Error) => {
                        res.status(400).json({ message: err.message, donationform: donation });
                    });
                }).catch((err:Error) => {
                    res.status(400).json({ message: err.message, donationform: donation });
                });
                return;
            }
        }
        // If we looped through all of the users donations and couldn't find a matching donation form return error
        res.status(400).json({ message: `Could not find donation form with id ${formid} for user ${userid}`, donationform: {} });
    }).catch((err: Error) => {
        res.status(400).json({ message: err.message, donationform: {} });
    });
};
