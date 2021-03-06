import express from 'express';
import compression from 'compression';  // compresses requests
import session from 'express-session';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import flash from 'express-flash';
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import bluebird from 'bluebird';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import jwtAuthz from 'express-jwt-authz';
import { MONGODB_URI, SESSION_SECRET } from './util/secrets';
import {sendBatchNotification} from './util/notifications';

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as imageController from './controllers/imageUpload';

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use(
    express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);
const fileupload = require('express-fileupload');
app.use(fileupload());

const checkJwt = jwt({
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

// Routes
app.post('/upload', imageController.postImage);
app.post('/testpush', function(req, res) {
    res.send('testing push notification');
    // Add your ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx] to the array below to test sending push notifications to yourself. See the frontend console for a line like Expo Push Token : ExponentPushToken[sfdjiodojifsdojisdfjio]
    sendBatchNotification('Umi Feeds (title)', 'this is a test (body)', ['']);
});

// Sub Routers
import donorRouter from './routes/donors';
import userRouter from './routes/users';
app.use('/api', donorRouter);
app.use('/api', userRouter);

/**
 * To make a request to this, go to https://manage.auth0.com/dashboard/us/bog-dev/apis/602861e9ea4b12003f71d5d8/test
 * and log in with the credentials in the Product Bitwarden. (Or, go to the Auth0 Dashboard > APIs > Umi-Feeds Test API
 * > Test tab.) Scroll down to the section "Sending the token to the API". Make a GET request to /test-auth0-security with the authorization header there; the value of the authorization header would be something like Bearer jifdojioijoggiojreioioviofiojblahblah
 * Note that this authorization token won't work forever; it expires after a couple hours.
 * The test page also provides information about how to get an authorization token programmatically instead of copying
 * it from that Auth0 dashboard page.
 */
app.get('/test-auth0-security', checkJwt, (req, res) => {
    res.send('Secured');
});

export default app;

