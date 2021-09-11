import express from 'express';

import APIRoutes from './api';
import SignupRoute from './signup';
import LoginRoute from './login';
import TestingRoute from './testing';

const MainRouter = express.Router();

MainRouter.use('/api', APIRoutes);

MainRouter.use('/signup', SignupRoute);

MainRouter.use('/login', LoginRoute);

MainRouter.use('/testing', TestingRoute);

export default MainRouter;
