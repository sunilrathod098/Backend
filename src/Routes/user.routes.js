import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUserAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChennelProfile,
    getWatchHistrory
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router()

router.route('/register').post(
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
    ]),
    registerUser
)

router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateUserAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAccountDetails)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserAccountDetails)

router.route("/c/:username").get(verifyJWT, getUserChennelProfile)
router.route("/history").get(verifyJWT, getWatchHistrory)



export default router;