import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//this function is toggle a like while video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "No valid video Id found");
    }

    const isLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (!isLiked) {
        const removeLike = await Like.findByIdAndUpdate(isLiked._id);

        if (!removeLike) {
            throw new ApiError(500, "Error while removing like");
        }
    } else {
        const liked = await Like.create({
            video: videoId,
            likedBy: req.user?._id,
        });

        if (!liked) {
            throw new ApiError(500, "Error while liking video");
        }
    }

    return res.status(200)
        .json(new ApiResponse(200,
            {},
            "Video like status updated"));
});


//this function is toggle a like while commint
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "No valid comment Id found");
    }

    const isLiked = await Like.findOne({
        commint: commentId,
        likedBy: req.user?._id,
    });

    if (!isLiked) {
        const removeLike = await Like.findByIdAndUpdate(isLiked._id);

        if (!removeLike) {
            throw new ApiError(500, "Error while removing like");
        }
    } else {
        const liked = await Like.create({
            commint: commentId,
            likedBy: req.user?._id,
        });

        if (!liked) {
            throw new ApiError(500, "Error while liking comment");
        }
    }

    return res.status(200)
        .json(new ApiResponse(200,
            {},
            "Comment like status updated"));
});


//this function is toggle a like while commint
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "No valid comment Id found");
    }

    const isLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (!isLiked) {
        const removeLike = await Like.findByIdAndUpdate(isLiked._id);

        if (!removeLike) {
            throw new ApiError(500, "Error while removing like");
        }
    } else {
        const liked = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id,
        });

        if (!liked) {
            throw new ApiError(500, "Error while liking tweet");
        }
    }

    return res.status(200)
        .json(new ApiResponse(200,
            {},
            "Tweet like status updated"));
});


//this is function is get likes while videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
    } = req.query;

    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video',
                pipeline: [
                    {
                        $match: { isPublished: true },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $match: {
                video: { $exists: true },
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        }
    ]);

    if (!likedVideo) {
        throw new ApiError(500, "Error while retrived liked videos")
    }

    return res.status(200)
        .json(new ApiResponse(200,
            likedVideo,
            "Liked video retrived successfully"));
});


export {
    getLikedVideos, toggleCommentLike,
    toggleTweetLike, toggleVideoLike
};
