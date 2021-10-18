import express from 'express';
import * as ongoingDonationsController from '../../controllers/ongoingDonationsController';

const router = express.Router();

/*
* Code routes here for CRUD on DonationForms
*/
router.get('', ongoingDonationsController.getOngoingDonations);
router.put('/:donationID', ongoingDonationsController.updateOngoingDonation);
router.delete('/:donationID', ongoingDonationsController.deleteOngoingDonation);
export default router;
