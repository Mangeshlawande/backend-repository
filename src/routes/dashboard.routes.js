import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { 
    getChannelStatus,
    getChannelVideos,
} from '../controllers/dashboard.controller.js'


const router  = Router();

router.use(verifyJWT);// Apply verifyJWT middleware to all routes

router.route('/status').get(getChannelStatus);
router.route('/videos').get(getChannelVideos);

export default router