import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import jwt_decode, { JwtPayload } from 'jwt-decode';

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

export const checkAdmin = function (req: any, res: any, next: any) {
    const jwt_decoded = <JwtPayload>jwt_decode(req.headers.authorization);
    if ('https://bitsofgood.org/roles' in jwt_decoded) {
        if ((<Array<string>>jwt_decoded['https://bitsofgood.org/roles']).includes('Umifeeds-Admin')) {
            next();
        } else {
            throw new Error('User is not an Admin');
        }
    } else {
        throw new Error('User is not registered with a role in the Umifeeds organization');
    }
};

export const isAdmin = function (jwtTokenDecoded:JwtPayload) {
    return ('https://bitsofgood.org/roles' in jwtTokenDecoded) && ((<Array<string>>jwtTokenDecoded['https://bitsofgood.org/roles']).includes('Umifeeds-Admin'));
};
