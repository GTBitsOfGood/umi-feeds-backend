import express from 'express';

import DishRoutes from './dishes';
import DonationFormRoutes from './donations';
import userRoute from './user';

const router = express.Router();

router.use('/user', userRoute);

router.use('/', DishRoutes);

router.use('/donationform', DonationFormRoutes);

export default router;
