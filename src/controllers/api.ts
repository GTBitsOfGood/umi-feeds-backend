'use strict';

import express, { Response, Request, NextFunction } from 'express';
import { User } from '../models/User';
import { Donor } from '../models/Donor';
import { Donations } from '../models/Donations';
import mongoose from 'mongoose'


/**
 * List of API examples.
 * @route GET /api
 */

 export const getApi = (req: Request, res: Response) => {
    res.render('api/index', {
        title: 'API Examples'
    });
};

/**
 * Gets Donors
 * @route GET /getDonors
 */
export const getDonors = (req: Request, res: Response) => {
    Donor.find()
    .then(results => {
        return res.status(200).json({
            donors: results,
        })
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        })
    })
};

/**
 * Posts Donors
 * @route POST /postDonors
 */
export const postDonors = (req: Request, res: Response) => {
    let { name, longitude, latitude } = req.body;
    const donor = new Donor({
        name,
        longitude, 
        latitude 
    });
    return donor.save()
    .then(result => {
        return res.status(201).json({
            donor: result
        })
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        })
    })
};

/**
 * Gets Donors
 * @route GET /getDonors
 */
export const getDonations = (req: Request, res: Response) => {
    Donations.find()
    .then(results => {
        return res.status(200).json({
            donations: results,
        })
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        })
    })
};

/**
 * Posts Donations
 * @route POST /postDonations
 */
export const postDonations = (req: Request, res: Response) => {
    let { donor, availability, pickup, description, descriptionImages, pickupInstructions} = req.body;
    const donation = new Donations({
        donor, 
        availability,
        pickup,
        description,
        descriptionImages,
        pickupInstructions
    });
    return donation.save()
    .then(result => {
        return res.status(201).json({
            donor: result
        })
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message
        })
    })
};

