import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
            required: true,
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


export const Like = mongoose.model("Like", likeSchema);