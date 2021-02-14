'use strict';

import { Response, Request, NextFunction } from 'express';
import { UserDocument } from '../models/User';


/**
 * List of API examples.
 * @route GET /api
 */
export const getApi = (req: Request, res: Response) => {
    res.render('api/index', {
        title: 'API Examples'
    });
};


export const test = (req: Request, res: Response) => {
    res.send("Secured");
};
