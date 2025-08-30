import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js';
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,

} from '../controllers/comment.controller.js';




const router = Router();

// apply verifyJWT middleware to all routes 
router.use(verifyJwt);

router.route('/:videoId').get(getVideoComments).post(addComment);

router.route('/:commentId').patch(updateComment).delete(deleteComment);


export default router;