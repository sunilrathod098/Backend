import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloud } from "../utils/fileUpload.js";


//generate token function-backend
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}



//registerUser function-backend
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    // console.log("email:", email)

    //validation - check
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check user is existed or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist.")
    }

    //check image and avatar files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    //if not hit error
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required")
    }

    //uploading files on cloudinary
    const avatar = await uploadOnCloud(avatarLocalPath)
    const coverImage = await uploadOnCloud(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //create new user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    //remove password and refreshToken from the create user
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return a success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})



//loginUser function-backend
const loginUser = asyncHandler(async (req, res) => {

    //extract login credinatials from the body
    const { username, email, password } = req.body;

    // console.log(email) // debbuging the body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //find user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    //compare provided password and stored one
    const isPasswordvalid = await user
        .isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid user Credentials")
    }

    //generate refreshToken and AccessToken
    const { refreshToken, accessToken } = await
        generateAccessTokenAndRefreshToken(user._id)


    //retrive user info without sensitive feilds
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    //there's are the cookie settings
    const options = {
        httpOnly: true,
        secure: true
    }

    //return a success response
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})



//logoutUser function-backend
const logoutUser = asyncHandler(async (req, res) => {

    //update the user in the database and clear the refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    //return succsee response and clear the cookies
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out done!"))
})



//refreshAccessToken function-backend

//Why we use this method?
/* The refreshAccessToken method is used when a user has been active for a long time and the token expires.
If the user tries to continue their session by re-logging in, this method sends a refresh token to an endpoint.
The backend then compares the provided refresh token with the stored one, and if they match, the session is restarted. */

const refreshAccessToken = asyncHandler(async (req, res) => {

    //extract the refreshToken form cookies or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    //check the refreshToken is present or not 
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    //verifying the token
    try {
        const decodedToken = jwt
            .verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        //find the user by there id
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        //check the refreshToken is valid or invalid by comparing other token
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expried or used")
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        //generate the new tokens
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        //return success response and cookies
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed done"
                ))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})


// export the function to be used in other files
export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser
};

