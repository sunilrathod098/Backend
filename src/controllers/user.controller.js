import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloud } from "../utils/fileUpload.js";


//registerUser mathod
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;
    console.log("email:", email)

    //validation - check
    if (
        [fullName, email, username, password]
            .some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //check user is existed or not
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist.")
    }

    //check image and avatar files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
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

    //remove password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


//loginUser method



export { registerUser }; // export the function to be used in other files
