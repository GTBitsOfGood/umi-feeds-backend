import express from 'express';
import * as userController from '../../controllers/userController';

const router = express.Router();
/*
* Code routes here for CRUD on users
*/

router.get('/businessName/:businessName', userController.getUserByBusinessName);
router.get('/roles', userController.getUsersByRoles);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/pickupAddress/:id', userController.addPickupAddress);
router.put('/pickupAddress/:id', userController.editPickupAddress);
router.delete('/pickupAddress/:id', userController.deletePickupAddress);
export default router;
