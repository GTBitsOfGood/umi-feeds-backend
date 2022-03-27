import express from 'express';
import { validatePasscode } from '../../controllers/securesignup';

const router = express.Router();
/*
* Code routes here for login
*/
router.get('/:userpasscode', validatePasscode);

export default router;
