import express from 'express';
import * as donorController from "../controllers/donorController"

const router = express.Router()
router.get('/donors', donorController.getDonors)
router.post('/donors', donorController.postDonors)
router.get('/donations', donorController.getDonations)
router.post('/donations', donorController.postDonations)

export default router;