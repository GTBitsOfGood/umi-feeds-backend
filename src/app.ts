import express from 'express';
import compression from 'compression'; // compresses requests
import session from 'express-session';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import path from 'path';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import cors from 'cors';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MONGODB_URI, SESSION_SECRET } from './util/secrets';
import { sendBatchNotification } from './util/notifications';
import { checkAdmin, checkJwt, userJwt } from './util/auth';

// Controllers (route handlers)
import * as imageController from './controllers/imageUpload';

// Sub Routers
import donorRouter from './routes/donors';
import userRouter from './routes/users';

const MongoStore = mongo(session);

// Create Express server
const app = express();

// Connect to MongoDB
const ENVIRONMENT = process.env.NODE_ENV;
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

if (ENVIRONMENT !== 'test') {
    mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
        () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
} else if (ENVIRONMENT === 'test') {
    // Connect to mongo memory server for testing
    const mongoServer = new MongoMemoryServer(); // in-memory server

    mongoServer.getUri().then((mongoUri: string) => {
        mongoose.connect(mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
            () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ }
        ).catch(err => {
            console.log(`Mock MongoDB connection error. Please make sure MongoDB is running. ${err}`);
            // process.exit();
        });
    });
}

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(
    express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);
const fileupload = require('express-fileupload');

app.use(fileupload());

// Routes
app.post('/upload', imageController.postImage);
app.post('/testpush', (req, res) => {
    res.send('testing push notification');
    // Add your ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx] to the array below to test sending push notifications to yourself. See the frontend console for a line like Expo Push Token : ExponentPushToken[sfdjiodojifsdojisdfjio]
    sendBatchNotification('Umi Feeds (title)', 'this is a test (body)', ['']);
});
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
    // console.log(req);
    res.send('Secured');
});

app.get('/test-admin-access', userJwt, checkAdmin, (req, res) => {
    res.send('Secured');
});

app.post('/upload', imageController.postImage);

export default app;
