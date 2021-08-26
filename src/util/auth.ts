import jwt from 'express-jwt';
import { Response, Request, NextFunction } from 'express';
import jwksRsa from 'jwks-rsa';
import jwt_decode, { JwtPayload } from 'jwt-decode';

type customJWTPayload = JwtPayload & { 'https://bitsofgood.org/roles': Array<string> }

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
    // audience: 'https://test/',
    issuer: 'https://bog-dev.us.auth0.com/',
    algorithms: ['RS256']
});

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    const role = 'https://bitsofgood.org/roles';
    const jwt_decoded = <customJWTPayload>jwt_decode(req.headers.authorization);
    if ('https://bitsofgood.org/roles' in jwt_decoded) {
        if ((<Array<string>>jwt_decoded[role]).includes('Umifeeds-Admin')) {
            next();
        } else {
            throw new Error('User is not an Admin');
        }
    } else {
        throw new Error('User is not registered with a role in the Umifeeds organization');
    }
};

export const isAdmin = (jwtTokenDecoded: customJWTPayload) => {
    return ('https://bitsofgood.org/roles' in jwtTokenDecoded) && ((<Array<string>>jwtTokenDecoded['https://bitsofgood.org/roles']).includes('Umifeeds-Admin'));
};
