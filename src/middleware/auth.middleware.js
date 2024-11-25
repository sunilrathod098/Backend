import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();

        //debugging
        console.log("Token from Cookie:", req.cookies?.accessToken);
        console.log("Token from Header:", req.header("Authorization"));


        //check if the token is missing
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        //check the token is valid or invalid
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Debugging: Log the decoded token
        // console.log("Decoded Token:", decodedToken);

        //find the token by user without sensitive feilds
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        console.log(user)

        //check if the user is exist or not
        if (!user) {
            throw new ApiError(401, "Invalid access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        // Debugging: Log the error
        console.error("JWT Verification Error:", error.message);

        // If jwt.verify throws an error, it's usually because of an invalid or expired token
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token has expired, please log in again");
        }

        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})

