import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        avatar: {
            type: String, // this avatar is generated from Cloudinary URL
            required: true,
        },
        coverImage: {
            type: String, // this coverImage is generated from Cloudinary URL
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video",
            },
        ],
        // watchLater: {
        //     type: Schema.Types.ObjectId,
        //     ref: "video",
        // },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

//this are the middleware functions save before user run
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next()

    //this method is user for encrypt (into a hash code unreadble message type) the password
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//this method is user for decrypt (into a hash code readble password type) the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//this code is generate a access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


//and this code is ganaretaed a refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET
        }
    )
}


export const User = mongoose.model("User", userSchema);
