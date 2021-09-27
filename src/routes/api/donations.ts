import express from 'express';
import * as donationFormController from '../../controllers/donationFormController';

const router = express.Router();

/*
* Code routes here for CRUD on DonationForms
*/
router.get('', donationFormController.getDonationForms);
router.get('/ongoing', donationFormController.getOngoingDonationForms);
router.post('', donationFormController.postDonationForm);
router.put('', donationFormController.putDonationForm);
router.delete('', donationFormController.deleteDonationForm);
export default router;
