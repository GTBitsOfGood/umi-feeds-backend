import { Response, Request } from 'express';
import { User } from '../models/User/index';
import { DonationForm } from '../models/User/DonationForms';
/* eslint quote-props: ["error", "consistent"] */

/**
 * Gets Donation Forms within the past 30 days
 * @route GET /api/search/donations/last30days
 *
 */
export const last30DaysDonationsHistory = (req: Request, res: Response) => {
    const numDays = 30;
    return User.aggregate([
        {
            '$match': {
                'donations': {
                    '$exists': true
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'donations': 1
            }
        }, {
            '$unwind': {
                'path': '$donations',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'donations.status': 'Delivered'
            }
        }, {
            // Check if donation's drop off time was within 30 days of the current day
            // by converting to milliseconds, subtracting from 30 days ago in ms and comparing
            '$match': {
                'donations.confirmDropOffTime': {
                    '$gt': new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * numDays))
                }
            }
        }
    ]).then((result) => {
        if (result) {
            // Format Mongoose aggregation output to array of DonationForms
            const formattedResult:DonationForm[] = [];
            for (let i = 0; i < result.length; i++) {
                formattedResult.push(result[i].donations);
            }
            res.status(200).json({ 'donations': formattedResult });
        } else {
            res.status(200).json({ 'donations': [] });
        }
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
};

/**
* Gets past Donations forms in the specified month
* Attaches Donation with proper name
* @route GET /api/search/donations/:month/:year
*
*/
export const monthDonationsHistory = (req: Request, res: Response) => {
    const month:number = +req.params.month;
    const year:number = +req.params.year;

    return User.aggregate([
        {
            '$match': {
                'donations': {
                    '$exists': true
                }
            }
        }, {
            '$unwind': {
                'path': '$donations',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$project': {
                '_id': 1,
                'donations': 1,
                'dishes': '$dishes',
                'year': {
                    '$year': '$donations.confirmDropOffTime'
                },
                'month': {
                    '$month': '$donations.confirmDropOffTime'
                },
                'name': '$name',
                'businessName': '$businessName',
                'email': '$email',
                'phoneNumber': '$phoneNumber',
                'donationDishes': '$donations.donationDishes'
            }
        }, {
            '$unwind': {
                'path': '$dishes',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$donationDishes',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                '$expr': {
                    '$eq': [
                        '$donationDishes.dishID', '$dishes._id'
                    ]
                }
            }
        }, {
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
            '$match': {
                'donations.status': 'Delivered'
            }
        }, {
            '$match': {
                'year': year,
                'month': month
            }
        }, {
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
                    '$first': '$donations.pickupInstructions'
                },
                'businessName': {
                    '$first': '$businessName'
                },
                'status': {
                    '$first': '$donations.status'
                },
                'ongoing': {
                    '$first': '$donations.ongoing'
                },
                'imageLink': {
                    '$first': '$donations.imageLink'
                },
                'pickupAddress': {
                    '$first': '$donations.pickupAddress'
                },
                'pickupStartTime': {
                    '$first': '$donations.pickupStartTime'
                },
                'pickupEndTime': {
                    '$first': '$donations.pickupEndTime'
                },
                'confirmPickUpTime': {
                    '$first': '$donations.confirmPickUpTime'
                },
                'confirmDropOffTime': {
                    '$first': '$donations.confirmDropOffTime'
                },
                'volunteerLockTime': {
                    '$first': '$donations.volunteerLockTime'
                },
                'lockedByVolunteer': {
                    '$first': '$donations.lockedByVolunteer'
                },
                'userID': {
                    '$first': '$donations.userID'
                },
                'dropOffAddress': {
                    '$first': '$donations.dropOffAddress'
                },
                'dropOffInstructions': {
                    '$first': '$donations.dropOffInstructions'
                },
                'volunteerUserID': {
                    '$first': '$donations.volunteerUserID'
                }
            }
        }
    ]).then((result) => {
        if (result) {
            // Format Mongoose aggregation output to array of DonationForms
            const formattedResult:DonationForm[] = [];
            for (let i = 0; i < result.length; i++) {
                formattedResult.push(result[i]);
            }
            res.status(200).json({ 'donations': formattedResult });
        } else {
            res.status(200).json({ 'donations': [] });
        }
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
};
