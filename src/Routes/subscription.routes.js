import { Router } from "express";
import {
    getSubscriberChannel,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkUser } from "../middleware/OAuth.middleware.js";



const router = Router()

router
    .route("/c/:channelId")
    .get(verifyJWT, getUserChannelSubscribers)
    .post(verifyJWT, toggleSubscription);

router.route("/u/:subscriberId").get(checkUser, getSubscriberChannel);

export default router;