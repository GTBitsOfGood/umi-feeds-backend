import express from 'express';
import * as signupController from '../../controllers/signupController';

import { userJwt } from '../../util/auth';

const router = express.Router();
/*
* Code routes here for signup
*/

router.post('/', userJwt, signupController.postUserSignUp);

export default router;
