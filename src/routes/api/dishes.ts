import express from 'express';
import * as dishesController from '../../controllers/dishesController';

const router = express.Router();
/*
* Code routes here for CRUD on dishes
*/
router.get('', dishesController.getDish);
router.post('', dishesController.postDish);
router.put('', dishesController.updateDish);
router.delete('', dishesController.deleteDish);
export default router;
