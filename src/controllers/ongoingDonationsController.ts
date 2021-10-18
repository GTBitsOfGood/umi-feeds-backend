import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { OngoingDonation, OngoingDonationDocument } from '../models/User/DonationForms';
import { uploadImageAzure, deleteImageAzure } from '../util/azure-image';

/**
 * Gets all ongoing donations
 * @route GET /api/ongoingdonations
 *
 */
export const getOngoingDonations = (req: Request, res: Response) => {
    OngoingDonation.find()
        .then((results : OngoingDonationDocument[]) => res.status(200).json({ 'Ongoing Donations': results }))
        .catch((error: Error) => res.status(500).json({ message: error.message }));
};

/**
 * Updating corresponding ongoing donation
 * @route PUT /api/ongoingdonations/:donationID
 *
 */
export const updateOngoingDonation = (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }
    if (!req.files || !req.files.donationImage) {
        res.status(400).json({ message: 'No image attached to key "donationImage" for ongoing donation.' });
        return;
    }

    if (!req.body.json) {
        res.status(400).json({ message: 'No data about dish attached to key "json".' });
        return;
    }

    if (!req.body.json && !req.files.donationImage) {
        res.status(400).json({ message: 'No data about ongoing donation attached to key "json" and no image attached to key "donationImage".' });
        return;
    }

    // Deletes old image from Azure
    OngoingDonation.findOne({ _id: donationId })
        .then((result: OngoingDonationDocument) => {
            const oldImageUrl:string = result.imageLink;
            deleteImageAzure(oldImageUrl)
                .catch((err: Error) => {
                    res.status(400).json({ message: err.message });
                });
        }).catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });

    // Handles image upload to Azure and updating entry in MongoDB
    Promise.resolve(uploadImageAzure(req.files.donationImage as UploadedFile)).then((url: string) => {
        const donationBody = JSON.parse(req.body.json);
        donationBody._id = donationId;
        donationBody.imageLink = url;
        return OngoingDonation.findOneAndUpdate({ _id: donationId }, donationBody, { useFindAndModify: false })
            .then((result: OngoingDonationDocument) => {
                if (result) {
                    res.status(201).json({ message: 'Success' });
                } else {
                    res.status(404).json({ message: 'The specified ongoing donation does not exist.' });
                }
            })
            .catch((error: Error) => {
                res.status(400).json({ message: error.message });
            });
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
};

/**
 * Delete corresponding ongoing donation
 * @route DELETE /api/ongoingdonations/:donationID
 *
 */
export const deleteOngoingDonation = (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }

    OngoingDonation.deleteOne({ _id: donationId })
        .then((result) => {
            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'Success' });
            } else {
                res.status(404).json({ message: 'The specified ongoing donation does not exist.' });
            }
        })
        .catch((error: Error) => {
            res.status(400).json({ message: error.message });
        });
};
