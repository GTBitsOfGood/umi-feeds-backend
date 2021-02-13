'use strict';

import { Response, Request, NextFunction } from 'express';
import app from '../app';
import { UserDocument } from '../models/User';
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');


/**
 * List of API examples.
 * @route GET /api
 */
export const getApi = (req: Request, res: Response) => {
    res.render('api/index', {
        title: 'API Examples'
    });
};

// enable use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// create middleware for checking the JWT
const checkJwt = jwt({
    // Dynamically provide a signing key
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://test-api/.well-known/jwks.json'
    }),

    // validate the audience and the issuer
    audience: process.env.AUTH0_AUDIENCE,
    issuer: 'https://test-api/',
    algorithms: ['RS256']
});

app.post('/test-api', checkJwt, function(req, res){
    res.status(201)
    res.send("Authenticated")
})
