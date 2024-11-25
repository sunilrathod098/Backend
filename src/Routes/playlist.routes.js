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

router.route("/create").post(createPlaylist);
router.route("/userplaylist/:userId").get(getUserPlaylist)
router.route("/update/:playlistId").patch(updatePlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/delete/:videoId/:playlistId").delete(removeVideoFromPlaylist);
router.route("/playlist/:playlistId").get(getUserPlaylistById);
router.route("/:playlistId/videos/:videoId").get(getVideoPlaylist);

export default router;