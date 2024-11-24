import { Router } from 'express';
import {
    addComments,
    deleteComments,
    getVideoComment,
    updateComments
} from '../controllers/comment.controller.js';
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComment).post(addComments);
router.route("/:commentId").delete(deleteComments).patch(updateComments);

export default router