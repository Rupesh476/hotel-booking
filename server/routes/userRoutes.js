import express from 'express';
import {protect} from '../middleware/authMiddleware.js';
import {getUserData, storeRecentSearchedCities} from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/', protect, storeRecentSearchedCities);

export default userRouter