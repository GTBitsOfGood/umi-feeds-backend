import { Response, Request } from 'express';
import { User } from '../models/User/index';

import {deleteImageAzure, uploadImageAzure} from '../util/azure-image';

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
        .then((results) => {
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
        .then((results) => {
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
export const postDonationForm = (req: Request, res: Response) => {
    const userid = req.query.id || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request', donationform: {} });
        return;
    }

    // req.files.image should hold the uploaded image to forward to Azure
    if (req.files === undefined || req.files.image === undefined) {
        res.status(400).json({ message: 'No image included with key \'image\'', donationform: {} });
        return;
    }

    // req.body.data should hold the donationform information to save to the user
    if (req.body === undefined || req.body.data === undefined) {
        res.status(400).json({ message: 'No data about donation provided with key \'data\'', donationform: {} });
        return;
    }

    // UploadImage and Query User simultaneously by creating a promise out of both asynchronous tasks
    Promise.all(
        [
            // @ts-ignore Typescript worries req.files could be an UploadedFile, but it is always an object of UploadedFiles
            uploadImageAzure(req.files.image),
            User.findById(userid)
        ]
    ).then((values) => {
        // Parse the 'data' from the request body to get the new donation form
        const newDonationForm = JSON.parse(req.body.data);

        let currentUser;
        [newDonationForm.imageLink, currentUser] = values; // values is [imagelink, currentuser]

        currentUser.donations.push(newDonationForm);
        currentUser.save().then((updatedUser) => {
            res.status(200).json({ message: 'Success', donationform: updatedUser.donations[updatedUser.donations.length - 1] });
        }).catch((err) => {
            res.status(500).json({ message: err.message, donationform: {} });
        });
    }).catch((error: Error) => res.status(400).json({ message: error.message, donationform: {} }));
};

/**
 * Updates Donation Form fields based on provided data
 * @route PUT /api/donationform?id={userid}&donationFormID={formid}
 */
export const putDonationForm = (req: Request, res: Response) => {
    const userid = req.query.id || null;

    // We need a userid because all donation forms are stored under the user documents
    if (userid == null) {
        res.status(400).json({ message: 'No user id specified in request', donationform: {} });
        return;
    }

    console.log('implement the rest soon!');
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

    if (formid == null) {
        res.status(400).json({ message: 'No form id specified in request', donationform: {} });
        return;
    }

    User.findById(userid).then((result) => {
        // We need to loop through and find the donation form with the matching id
        for (const [i, donation] of result.donations.entries()) {
            if (donation._id.toString() === formid) {
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
        res.status(400).json({ message: `Could not find donation form with id ${formid} for user ${userid}`, donationform: {} });
    }).catch((err: Error) => {
        res.status(400).json({ message: err.message, donationform: {} });
    });
};