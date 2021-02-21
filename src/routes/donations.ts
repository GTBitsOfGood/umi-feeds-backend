import express from 'express';
import * as donation_controller from '../controllers/donation_controller';

const router = express.Router();
router.delete('/donations/:donation_id', donation_controller.deleteDonation);

export default router;