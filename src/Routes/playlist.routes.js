import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getUserPlaylist,
    getUserPlaylistById,
    getVideoPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router
    .route("/:playlistId")
    .get(getUserPlaylist)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/delete/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylistById);
router.route("/:playlistId/videos/:videoId").get(getVideoPlaylist);

export default router;