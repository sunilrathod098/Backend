import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()
router.use(verifyJWT);

router.route("/stats").get(getChannelStats);
router.route("/video").get(getChannelVideos);

export default router;