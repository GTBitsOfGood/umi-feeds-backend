import express from 'express';
import * as searchController from '../../controllers/searchController';

const router = express.Router();
/*
* Code routes here for search
*/
router.get('/donations/last30days', searchController.last30DaysDonationsHistory);
router.get('/donations/:month/:year', searchController.monthDonationsHistory);

export default router;
