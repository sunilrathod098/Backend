import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";
import { video } from "../models/video.model.js"
import { subscription } from "../models/subscription.model.js"
import { like } from "../models/likes.model.js"


//this function work like get the all channels stats
const getChannelStats = asyncHandler( async (req, res) => {
    const channelId = req.user?._id;

    const userChannel = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "channelVideos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            isPublished: 1,
                            views: 1,
                        }
                    },
                    {
                        $match: {
                            isPublished: true
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        addFields: {
                            videoLikeCounts: {
                                $size: "$videoLikes"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalLikeCounts: {
                    $sum: "$channelVideos.videoLikeCounts"
                },
                totalViews: {
                    $sum: "$channelVideos.views"
                },
                totalVideoCount: {
                    $size: "$channelVideos"
                }
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "channelSubscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalSubscriberCount: {
                    $size: "$channelSubscribers"
                }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                watchHistory: 0
            }
        }
    ]);

    if (!userChannel) {
        throw new ApiError(400, "Could not fetch channel details")
    }

    return res.status(200)
    .json(new ApiResponse(200,
        userChannel,
        "user channel stats fetched successfully"
    ));
});


//this function work like get the all videos from channels
const getChannelVideos = asyncHandler( async (req, res) => {
    const channelVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ]);

    if (!channelVideos) {
        throw new ApiError(404, "Channel videos not found")
    }

    return res.status(200)
    .json(new ApiResponse(200,
        channelVideos,
        "channel videos fetched successfully"
    ));

});


export {
    getChannelStats,
    getChannelVideos
};