import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        //check if the token is missing
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        //check the token is valid or invalid
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        //find the token by user without sensitive feilds
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        //check if the user is exist or not
        if (!user) {
            throw new ApiError(401, "Invalid access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})

