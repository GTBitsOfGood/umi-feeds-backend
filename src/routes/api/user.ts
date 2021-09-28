import express from 'express';
import * as userController from '../../controllers/userController';

const router = express.Router();
/*
* Code routes here for CRUD on users
*/
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);
export default router;
