import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();
router.post('/users', userController.postUsers);
router.get('/tokens', userController.getTokens);

export default router;
