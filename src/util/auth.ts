import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkJwt = jwt({
    // Dynamically provide a signing key
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://bog-dev.us.auth0.com/.well-known/jwks.json'
    }),

    // validate the audience and the issuer
    audience: 'https://test/',
    issuer: 'https://bog-dev.us.auth0.com/',
    algorithms: ['RS256']
});


export const userJwt = jwt({
    // Dynamically provide a signing key
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://bog-dev.us.auth0.com/.well-known/jwks.json'
    }),

    // validate the audience and the issuer
    //audience: 'https://test/',
    issuer: 'https://bog-dev.us.auth0.com/',
    algorithms: ['RS256']
});
