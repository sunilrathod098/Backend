import { Router } from "express";
import {
    getAllVideos,
    getDeleteVideo,
    getPublishedAVideo,
    getSubcribedVideos,
    getUpdateVideo,
    getUserVideos,
    getVideoById,
    togglePublishedStatus
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { checkUser } from "../middleware/OAuth.middleware.js";


const router = Router()


router.route("/all-videos").get(getAllVideos)
router.route("/user/:userId/videos").get(getUserVideos)
router.route("/:videoId").get(checkUser, getVideoById)

router.use(verifyJWT);

router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
    getPublishedAVideo
);

router.route("/:videoId")
    .delete(getDeleteVideo)
    .patch(upload.single("thumbnail"), getUpdateVideo);

router.route("/s/subscription").get(getSubcribedVideos);
router.route("/toggle/publish/:videoId").patch(togglePublishedStatus);

export default router;