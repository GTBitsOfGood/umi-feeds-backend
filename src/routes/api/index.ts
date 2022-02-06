import express from 'express';

import DishRoutes from './dishes';
import DonationFormRoutes from './donations';
import OngoingDonationRoutes from './ongoingDonations';
import userRoute from './user';
import SearchRoutes from './search';

const router = express.Router();

router.use('/user', userRoute);

router.use('/dishes', DishRoutes);

router.use('/donationform', DonationFormRoutes);

router.use('/ongoingdonations', OngoingDonationRoutes);

router.use('/search', SearchRoutes);

export default router;
