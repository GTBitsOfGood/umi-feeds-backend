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
            // Break down confirmDropOffTime to Month and Year and store for comparison
            // Pull name, businessName, email, and phoneNumber from user
            '$project': {
                '_id': 0,
                'donations': 1,
                'year': {
                    '$year': '$donations.confirmDropOffTime'
                },
                'month': {
                    '$month': '$donations.confirmDropOffTime'
                },
                'name': '$name',
                'businessName': '$businessName',
                'email': '$email',
                'phoneNumber': '$phoneNumber'
            }
        }, {
            // Add corresponding info fields to donations
            '$addFields': {
                'donations.name': '$name',
                'donations.businessName': '$businessName',
                'donations.email': '$email',
                'donations.phoneNumber': '$phoneNumber'
            }
        }, {
            // Filter for delivered and corresponding month & year donations
            '$match': {
                'donations.status': 'Delivered'
            }
        }, {
            '$match': {
                'year': year,
                'month': month
            }
        }, {
            // Return filtered donations
            '$project': {
                '_id': 0,
                'donations': 1
            }
        }
    ]).then((result) => {
        if (result) {
            // Format Mongoose aggregation output to array of DonationForms
            console.log(result);
            const formattedResult:DonationForm[] = [];
            for (let i = 0; i < result.length; i++) {
                formattedResult.push(result[i].donations);
            }
            console.log(formattedResult);
            res.status(200).json({ 'donations': formattedResult });
        } else {
            res.status(200).json({ 'donations': [] });
        }
    }).catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
};
