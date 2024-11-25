import { Router } from "express";
import {
    getSubscriberChannel,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkUser } from "../middleware/OAuth.middleware.js";



const router = Router()


router.route("/userchannel/:channelId").get(verifyJWT, getUserChannelSubscribers);
router.route("/subscribetoggle/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subchannnel/:subscriberId").get(checkUser, getSubscriberChannel);

export default router;