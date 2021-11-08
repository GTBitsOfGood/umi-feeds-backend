import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { User, UserDocument } from '../models/User/index';
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
export const deleteOngoingDonation =  async (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }

    // Set up transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get userId to modify status in User's donation array
        const ongoingDonation:OngoingDonationDocument = await OngoingDonation.findById(donationId);
        if (!ongoingDonation) {
            throw new Error('Specified donation does not exist');
        }
        const userId = ongoingDonation.userID;

        // Delete specified ongoing donation from queue
        const deletedQueueResponse = await OngoingDonation.deleteOne({ _id: donationId }).session(session);
        if (deletedQueueResponse.deletedCount !== 1) {
            throw new Error('Could not delete donation from Ongoing Donation Queue.');
        }

        // Update status and ongoing of specified donation in User's donation array
        const updatedDonationResponse:mongoose.UpdateWriteOpResult = await User.updateOne({ _id: userId, 'donations._id': donationId }, { $set: { 'donations.$.status': 'completed', 'donations.$.ongoing': false  } }).session(session);

        if (updatedDonationResponse.nModified  !== 1) {
            throw new Error('Could not update donation status for User.');
        }

        /*
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
            }); */

        // Commit transaction after deleting donation from queue and marking it as complete in array
        await session.commitTransaction();
        res.status(200).json({
            message: 'Success',
            donationForm: ongoingDonation
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
