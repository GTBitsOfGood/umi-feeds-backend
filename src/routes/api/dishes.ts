import express from 'express';
import * as dishesController from "../../controllers/dishesController"

const router = express.Router();
/*
* Code routes here for CRUD on dishes
*/

/* 
router.get('/dishes', dishesController.getDishesByUser);
router.get('/dishes', dishesController.getDishByUserAndDishID);
router.post('/dishes', dishesController.postDish);
router.put('/dishes', dishesController.updateDish);
router.delete('/dishes', dishesController.deleteDish);
*/

export default router;
