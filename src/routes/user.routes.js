import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(registerUser);


export default router;
// for default we can give custom name --> in import userRouter from './routes/user.routes.js';
