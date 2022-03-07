import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { User, UserDocument } from '../models/User/index';
import { OngoingDonation, OngoingDonationDocument } from '../models/User/DonationForms';
import { sendBatchNotification } from '../util/notifications';
/* eslint quote-props: ["error", "consistent"] */
/**
 * Gets all ongoing donations
 * Uses MongoDB aggregations and lookup to get detailed dishes information
 * based on User's dishes and ongoingDonation's donationDishes
 *
 * @route GET /api/ongoingdonations
 *
 */
export const getOngoingDonations = (req: Request, res: Response) => {
    return OngoingDonation.aggregate([
        {
            // Perform join on matching user id
            '$lookup': {
                'from': 'users',
                'localField': 'userID',
                'foreignField': '_id',
                'as': 'joinedUser'
            }
        }, {
            // Add new joined fields
            '$addFields': {
                'dishes': '$joinedUser.dishes',
                'name': '$joinedUser.name',
                'phoneNumber': '$joinedUser.phoneNumber'
            }
        }, {
            // New fields are default arrays so unwinded to objects and values
            '$unwind': {
                'path': '$dishes',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$name',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$phoneNumber',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$project': {
                'joinedUser': 0
            }
        }, {
            // Unwind donationDishes and dishes
            '$unwind': {
                'path': '$donationDishes',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$dishes',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            // Matched donation dishes and User's dishes
            '$match': {
                '$expr': {
                    '$eq': [
                        '$donationDishes.dishID', '$dishes._id'
                    ]
                }
            }
        }, {
            // "Join" dishes
            '$addFields': {
                'mergedDishes': {
                    '$mergeObjects': [
                        '$dishes', '$donationDishes'
                    ]
                }
            }
        }, {
            '$project': {
                'donationDishes': 0,
                'dishes': 0
            }
        }, {
            // Rewind unwindings
            '$group': {
                '_id': '$_id',
                'donationDishes': {
                    '$push': '$mergedDishes'
                },
                'name': {
                    '$first': '$name'
                },
                'phoneNumber': {
                    '$first': '$phoneNumber'
                },
                'pickupInstructions': {
                    '$first': '$pickupInstructions'
                },
                'businessName': {
                    '$first': '$businessName'
                },
                'status': {
                    '$first': '$status'
                },
                'ongoing': {
                    '$first': '$ongoing'
                },
                'imageLink': {
                    '$first': '$imageLink'
                },
                'pickupAddress': {
                    '$first': '$pickupAddress'
                },
                'pickupStartTime': {
                    '$first': '$pickupStartTime'
                },
                'pickupEndTime': {
                    '$first': '$pickupEndTime'
                },
                'confirmPickUpTime': {
                    '$first': '$confirmPickUpTime'
                },
                'confirmDropOffTime': {
                    '$first': '$confirmDropOffTime'
                },
                'volunteerLockTime': {
                    '$first': '$volunteerLockTime'
                },
                'lockedByVolunteer': {
                    '$first': '$lockedByVolunteer'
                },
                'userID': {
                    '$first': '$userID'
                },
                'dropOffAddress': {
                    '$first': '$dropOffAddress'
                },
                'dropOffInstructions': {
                    '$first': '$dropOffInstructions'
                }
            }
        }
    ]).then((result) => {
        console.log(result);
        res.status(200).json({ 'Ongoing Donations': result });
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
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
        console.log(newDonationForm);

        // Modify dishIDs to ObjectID
        if (newDonationForm.donationDishes) {
            for (let i = 0; i < newDonationForm.donationDishes.length; i++) {
                newDonationForm.donationDishes[i].dishID = mongoose.Types.ObjectId(newDonationForm.donationDishes[i].dishID);
            }
        }

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
        console.log(err);
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
        const updatedDonationResponse:mongoose.UpdateWriteOpResult = await User.updateOne({ '_id': userId, 'donations._id': donationId }, { $set: { 'donations.$.status': 'dropped off', 'donations.$.ongoing': false } }).session(session);

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
        // Handle parallel concurrency errors accordingly
        if (String(err.message).substring(0, 77) === 'Plan executor error during findAndModify :: caused by :: WriteConflict error:') {
            res.status(400).json({
                message: 'Try Again in a Few Seconds'
            });
        } else {
            res.status(500).json({
                message: err.message
            });
        }
    } finally {
        session.endSession();
    }
};
