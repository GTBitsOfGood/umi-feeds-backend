import express from 'express';
import * as loginController from '../../controllers/loginController';

const router = express.Router();
/*
* Code routes here for login
*/
router.post('/:accesstoken', loginController.postLoginUser);
/*
router.get('/admin/passcode/:userpasscode', loginController.checkVolunteer);
router.post('/admin/passcode/:userpasscode', loginController.addVolunteerPW);
*/

export default router;
