import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';
import { OngoingDonation, OngoingDonationDocument } from '../models/User/DonationForms';
import { sendBatchNotification } from '../util/notifications';

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
 * @param {string} req.body.json Stringfied json with updated donation information
 *
 */
export const updateOngoingDonation = async (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }

    if (!req.body.json) {
        res.status(400).json({ message: 'No data about dish attached to key "json".' });
        return;
    }

    // Set up transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get userId from ongoing donation to modify donation in User's donation array
        const ongoingDonation:OngoingDonationDocument = await OngoingDonation.findById(donationId);
        if (!ongoingDonation) {
            throw new Error('Specified donation does not exist');
        }
        const userId = ongoingDonation.userID;

        // Get current User to access their donations array
        const currentUser:UserDocument = await User.findById(userId).session(session);

        if (!currentUser) {
            throw new Error('Specified user does not exist.');
        }

        // Processing JSON data payload
        const newDonationForm = JSON.parse(req.body.json);

        // Update specified donation as a part of User's donations array
        for (const donation of currentUser.donations) {
            if (donation._id.toString() === donationId) {
                for (const [key, value] of Object.entries(newDonationForm)) {
                    // Replace all of the old values in the donationform
                    // @ts-ignore Key is always a string, but Typescript finds that confusing
                    donation[key] = value;
                }
            }
        }

        const [updatedDonation, updatedOngoing] = await Promise.all(
            [
                currentUser.save(),
                OngoingDonation.findByIdAndUpdate(donationId, newDonationForm, { new: true }).session(session),
            ]
        );
        // Saves updated donation to User donation array
        // const updatedDonation:UserDocument = await currentUser.save();
        if (!updatedDonation) {
            throw new Error('Failed to update donation for specified user');
        }

        // Update specified donation in Ongoing Donation Queue
        // const updatedOngoing = await OngoingDonation.findByIdAndUpdate(donationId, newDonationForm, { new: true }).session(session);
        if (!updatedOngoing) {
            throw new Error('Failed to update Ongoing Donation for specified user.');
        }

        // Commit transaction once updated in both collections
        await session.commitTransaction();
        res.status(200).json({
            message: 'Success',
            donationform: updatedOngoing
        });

        // Push notification to user if status of the ongoing donation has changed
        try {
            if (ongoingDonation.status !== updatedOngoing.status) {
                sendBatchNotification('Donation Update',
                    `Your donation has been updated to ${updatedOngoing.status}. Please refresh!`,
                    currentUser.pushTokens);
            }
        } catch (err) {
            // Okay if notification fails but log if it does
            console.error(`Notification failed to send: ${err}`);
        }
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
 * Delete corresponding ongoing donation
 * @route DELETE /api/ongoingdonations/:donationID
 *
 */
export const deleteOngoingDonation = async (req: Request, res: Response) => {
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
        const updatedDonationResponse:mongoose.UpdateWriteOpResult = await User.updateOne({ _id: userId, 'donations._id': donationId }, { $set: { 'donations.$.status': 'dropped off', 'donations.$.ongoing': false } }).session(session);

        if (updatedDonationResponse.nModified !== 1) {
            throw new Error('Could not update donation status for User.');
        }

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
