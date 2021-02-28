import { Response, Request, NextFunction } from 'express';
import { Donor } from '../models/Donor';
import { Donation } from '../models/Donation';
import { UploadedFile } from 'express-fileupload';
import storage from 'azure-storage';
import fs from 'fs';

const containerName = 'image-container';

/**
 * Gets Donations
 * @route GET /donors
 */
export const getDonors = (req: Request, res: Response) => {
    Donor.find()
    .then(results => {
        return res.status(200).json({
            donors: results,
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Posts Donors
 * @route POST /donors
 */
export const postDonors = (req: Request, res: Response) => {
    const donor = new Donor(req.body);
    return donor.save()
    .then(result => {
        return res.status(201).json({
            donor: result
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Gets Donations
 * @route GET /donations
 */
export const getDonations = (req: Request, res: Response) => {
    Donation.find()
    .then(results => {
        return res.status(200).json({
            donations: results,
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};

/**
 * Posts Donations
 * @route POST /donations
 */
export const postDonations = async (req: Request, res: Response) => {
    const jsonBody = JSON.parse(req.body.json);
    try {
        if (!req.files.descriptionImage && !jsonBody.description) {
            res.status(400).send({
                status: false,
                message: 'No images attached to the key "descriptionImage" or description in your request',
                sentReq: String(req.files)
            });
        } else {
            const blobSVC = storage.createBlobService(process.env.CONNECTION_STRING_AZURE);
            const descriptionUrls: string[] = [];
            const foodUrls: string[] = [];

            if (req.files.descriptionImage) {
                const descriptionImages: UploadedFile[] = req.files.descriptionImage as UploadedFile[];

                if (!Array.isArray(descriptionImages)) {
                    const imgRequest = descriptionImages as UploadedFile;
                    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
                        if (error) {
                            console.error(`Error in createBlockBlobFromText: ${error}`);
                            return res.status(500).json({error: error.message});
                        }
                    });
                    const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
                    descriptionUrls.push(url);
                }

                for (let i = 0; i < descriptionImages.length; i++) {
                    const imgRequest = descriptionImages[i] as UploadedFile;

                    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
                        if (error) {
                            console.error(`Error in createBlockBlobFromText: ${error}`);
                            return res.status(500).json({error: error.message});
                        }
                    });
                    const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
                    descriptionUrls.push(url);
                }
            }

            if (req.files.foodImage) {
                const foodImages = req.files.foodImage as UploadedFile[];

                if (!Array.isArray(foodImages)) {
                    const imgRequest = foodImages as UploadedFile;
                    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
                        if (error) {
                            console.error(`Error in createBlockBlobFromText: ${error}`);
                            return res.status(500).json({error: error.message});
                        }
                    });
                    const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
                    foodUrls.push(url);
                }

                for (let i = 0; i < foodImages.length; i++) {
                    const imgRequest = foodImages[i] as UploadedFile;

                    blobSVC.createBlockBlobFromText(containerName, imgRequest.name, imgRequest.data, (error: Error) => {
                        if (error) {
                            console.error(`Error in createBlockBlobFromText: ${error}`);
                            return res.status(500).json({error: error.message});
                        }
                    });
                    const url = 'https://umifeedsimageupload.blob.core.windows.net/' + containerName + '/' + imgRequest.name; 
                    foodUrls.push(url);
                } 
            }
        
            jsonBody['descriptionImages'] = descriptionUrls;
            jsonBody['foodImages'] = foodUrls;
            const donation = new Donation(jsonBody);
            return donation.save()
            .then(result => {
                return res.status(201).json({
                    donation: result
                });
            })
            .catch(error => {
                return res.status(500).json({
                    message: error.message
                });
            }); 
        } 
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
};


/**
 * Query Donations available to pickup
 * @route GET /available-pickup
 */

export const availPickup = (req: Request, res: Response) => {
    Donation.find({ 
        'availability.startTime' : { '$lte' : new Date() },  
        'availability.endTime' : { '$gte' : new Date() }
    })
    .then(result => {
        return res.status(200).json({
            donation: result
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        });
    });
};


