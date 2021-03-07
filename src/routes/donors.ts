import express from 'express';
import * as donorController from '../controllers/donorController';

const router = express.Router();
router.get('/donors', donorController.getDonors);
router.post('/donors', donorController.postDonors);
router.get('/donations', donorController.getDonations);
router.post('/donations', donorController.postDonations);
router.delete('/donations/:donation_id', donorController.deleteDonation);
router.get('/available-pickup', donorController.availPickup);
router.put('/donations/:donation_id', donorController.modifyDonation);
router.put('/donors/:donor_id', donorController.modifyDonation);
router.get('/donors/:donor_id/donations', donorController.userDonations);

export default router;