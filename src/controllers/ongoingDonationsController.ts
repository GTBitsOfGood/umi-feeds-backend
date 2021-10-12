import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
//import { User, UserDocument } from '../models/User/index';
import { OngoingDonation, OngoingDonationDocument } from '../models/User/DonationForms'
import { uploadImageAzure, deleteImageAzure } from '../util/azure-image';


/**
 * Gets all ongoing donations
 * @route GET /api/ongoingdonations
 *
 **/
 export const getOngoingDonations = (req: Request, res: Response) => {
    OngoingDonation.find()
    .then((results : OngoingDonationDocument[]) => 
        res.status(200).json({ "Ongoing Donations" : results }))
    .catch((error: Error) => 
        res.status(500).json({ message: error.message }));
 }


 /**
 * Updating corresponding ongoing donation
 * @route PUT /api/ongoingdonations/:donationID
 *
 **/
  export const updateOngoingDonation = (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }
    OngoingDonation.updateOne({_id: donationId })
    .then((result: mongoose.UpdateWriteOpResult) => {
        if (result.nModified === 1) {
            res.status(201).json({ message: 'Success' });
        } else {
            res.status(404).json({ message: 'The specified ongoing donation does not exist.' });
        }
    })
    .catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
 }


 /**
 * Delete corresponding ongoing donation 
 * @route DELETE /api/ongoingdonations/:donationID
 *
 **/
  export const deleteOngoingDonation = (req: Request, res: Response) => {
    const donationId = req.params.donationID;

    if (!donationId) {
        res.status(400).json({ message: 'Missing ongoing donation id' });
        return;
    }

    OngoingDonation.updateOne({_id: donationId })
    .then((result: mongoose.UpdateWriteOpResult) => {
        if (result.nModified === 1) {
            res.status(200).json({ message: 'Success' });
        } else {
            res.status(404).json({ message: 'The specified ongoing donation does not exist.' });
        }
    })
    .catch((error: Error) => {
        res.status(400).json({ message: error.message });
    });
 }


 

