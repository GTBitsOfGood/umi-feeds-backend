import express from 'express';
import * as userController from '../../controllers/userController';

const router = express.Router();
/*
* Code routes here for CRUD on users
*/
router.get('/businessName/:businessName', userController.getUserByBusinessName);
router.get('/roles', userController.getUsersByRoles);
export default router;
