import express from 'express';

import DishRoutes from './dishes';
import DonationFormRoutes from './donations';
import OngoingDonationRoutes from './ongoingDonations';
import userRoute from './user';

const router = express.Router();

router.use('/user', userRoute);

router.use('/dishes', DishRoutes);

router.use('/donationform', DonationFormRoutes);

router.use('/ongoingdonations', OngoingDonationRoutes);

export default router;
