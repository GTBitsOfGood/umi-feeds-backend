import express from 'express';
import * as donorController from '../controllers/donorController';
import { userJwt } from '../util/auth';

const router = express.Router();
router.get('/donors', donorController.getDonors);
router.post('/donors', donorController.postDonors);
router.get('/donations', donorController.getDonations);
router.post('/donations', userJwt, donorController.postDonations);
router.delete('/donations/:donation_id', donorController.deleteDonation);
router.get('/available-pickup', donorController.availPickup);
router.put('/donations/:donation_id', donorController.modifyDonation);
router.put('/donors/:donor_id', donorController.modifyDonation);
router.get('/donors/:donor_id/donations', donorController.userDonations);
router.get('/donations/:donation_id', donorController.getDonationDetails);
router.get('/donors/:donor_id', donorController.getDonorDetails);
router.post('/donations/:donation_id/reserve', donorController.reserveDonation);
router.post('/donations/:donation_id/pick-up', donorController.pickUp);
router.post('/donations/:donation_id/drop-off', donorController.dropOff);
router.post('/donations/:donation_id/donor-confirm', donorController.confirmDonation);

export default router;
