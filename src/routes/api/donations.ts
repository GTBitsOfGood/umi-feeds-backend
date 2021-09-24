import express from 'express';
import * as donationFormController from '../../controllers/donationFormController';

const router = express.Router();
/*
* Code routes here for CRUD on DonationForms
*/
router.get('', donationFormController.getDonationForms);
export default router;
