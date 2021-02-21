'use strict';

import express, { Response, Request, NextFunction } from 'express';
import { User } from '../models/User';

/**
 * List of API examples.
 * @route GET /api
 */

 export const getApi = (req: Request, res: Response) => {
    res.render('api/index', {
        title: 'API Examples'
    });
};


