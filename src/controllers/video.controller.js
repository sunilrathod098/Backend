import fs from "fs";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscruption } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloud, uploadOnCloud } from "../utils/fileUpload.js";


function unlinkPath(videoLocalPath, thumbnailLocalPath) {
    if (videoLocalPath)
        fs.unlinkSync(videoLocalPath);
    if (thumbnailLocalPath)
        fs.unlinkSync(thumbnailLocalPath);
}


// function retrieves all videos from a db
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
    } = req.query;

    const videos = await Video.aggregate([
        ...(query
            ? [
                {
                    $match: {
                        $or: [
                            {
                                title: { $regex: query, $options: "i" },
                            },
                            {
                                description: { $regex: query, $options: "i" },
                            },
                        ],
                    },
                },
            ]
            : []),
        {
            $match: { isPublished: true }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                }
            }
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
            }
        },
        {
            $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit)
        },
    ]);

    if (!videos) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            videos,
            "Videos retrived successfully"));
});



//function retrives indiviual videos fron a db
const getUserVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc"
    } = req.query;

    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $match: { isPublished: true }
        },
        {
            $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                        },
                    },
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
            }
        }
    ]);

    if (!videos) {
        throw new ApiError(404, "Error While fetching videos")
    }


    return res.status(200)
        .json(new ApiResponse(
            200,
            videos,
            "Videos retrived successfully"));

});


//this function is published a video
const getPublishedAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!title || title.trim() === '') {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Title is required");
    }

    if (!videoLocalPath) {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloud(videoLocalPath);
    const thumbnail = await uploadOnCloud(thumbnailLocalPath);


    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video and thumbnail files are missing")
    }

    const video = await Video.create({
        videoFile: videoFile?.secure_url,
        thumbnail: thumbnail?.secure_url,
        title,
        duration: videoFile?.duration,
        description: description || "",
        owner: req.user?._id,
        // views: 0,
        // likes: 0,
        // dislikes: 0,
        // comments: []
    });

    if (!video) {
        throw new ApiError(500, "Error while uploading videos")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video uploaded successfully"))
})



//this function is retrive videos by there _id from db
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    //input validation
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(videoId)
            },
        },
        {
            //Left join likes collections
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            //this fields are add to the above like collections
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            //this are the user joins colletions to owner channel
            $lookup: {
                from: "user",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        }
                    },
                    {
                        //add some fileds in owner collections
                        $addFields: {
                            subscriberCount: {
                                $size: "$subscribers",
                            },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false,
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            subscriberCount: 1,
                            isSubscribed: 1,
                        }
                    }
                ]
            }
        },
        {
            //this is fields is select the first owner
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner: 1,
                createdAt: 1,
                comments: 1,
                likesCount: 1,
                isLiked: 1,
                subscriberCount: 1,
                isSubscribed: 1,
            }
        }
    ]);

    if (!video.length) {
        throw new ApiError(404, "Video dose not exists");
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1,
        }
    });


    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: {
            watchHistory: videoId,
        }
    });

    return res.status(200)
        .json(new ApiResponse(200,
            video[0],
            "Video viewed successfully",
        ))

})


//this function work to get update videos by there _id from db
const getUpdateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoId } = req.params;
    const thumbnailLocalPath = req.file?.path;

    if (!videoId || !isValidObjectId(videoId)) {
        unlinkPath(null, thumbnailLocalPath)
        throw new ApiError(400, "Invalid video Id")
    }

    if (!title && !description && !thumbnailLocalPath) {
        unlinkPath(null, thumbnailLocalPath)
        throw new ApiError(400, "At least one fields is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        unlinkPath(null, thumbnailLocalPath);
        throw new ApiError(404, "Video not found")
    }

    if (req.user?._id.ToString() !== video?.owner.ToString()) {
        unlinkPath(null, thumbnailLocalPath)
        throw new ApiError(
            403,
            "You do not have permission to perform this action and your not owner to this video!")
    }

    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloud(thumbnailLocalPath);

        if (!thumbnail) {
            throw new ApiError(400, "Error while uploading thumbnail on cloud");
        } else {
            const thumbnailUrl = video?.thumbnail;
            const regex = /\/([^/]+)\.[^.]+$/;
            const match = thumbnailUrl?.match(regex);

            if (!match) {
                throw new ApiError(400, "Couldn't find public Id of Old thumbnail")
            }

            const publicId = match[1];
            await deleteFromCloud(publicId);
        }
    }

    const updatevideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video?.title,
                description: description || video?.description,
                thumbnail: thumbnail?.secure_url || video?.thumbnail,
            }
        }
    );

    if (!updatevideo) {
        throw new ApiError(500, "Error while updating video")
    }

    return res.status(200)
        .json(new ApiResponse(200,
            updatevideo,
            "Video Updated successfully"));
});


//this function is delete the video
const getDeleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video is not found")
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "You do not have permission to delete this video")
    }

    await Video.findByIdAndUpdate(videoId);

    const thumbnailUrl = video?.thumbnail;
    const videoFileUrl = video?.videoFile;
    const regex = /\/([^/]+)\.[^.]+$/;


    let match = thumbnailUrl.match(regex);
    if (!match) {
        throw new ApiError(400, "Couldn't find public Id of thumbnail")
    }

    let publicId = match[1];
    const deleteThumbnail = await deleteFromCloud(publicId);

    match = videoFileUrl.match(regex);
    if (!match) {
        throw new ApiError(400, "Couldn't find public Id of video")
    }

    publicId = match[1];
    const deleteVideoFile = await deleteFromCloud(publicId, "video");
    if (deleteThumbnail.result !== "ok") {
        throw new ApiError(500, "Error while deleting thumbnail from cloud");
    }

    if (deleteVideoFile.result !== "ok") {
        throw new ApiError(500, "Error while deleting video from cloud");
    }

    return res.status(200)
        .json(new ApiResponse(200,
            {},
            "Video has been deleted successfully"));
})


//function is subscribed a video
const getSubcribedVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortType = "desc"
    } = req.query;

    const subscription = await Subscruption.find({
        subscriber: new mongoose.Types.ObjectId(req, user?._id),
    }).select("channel");

    const channelId = subscriptions.map((sub) => sub.channel);

    if (channelId.length === 0) {
        return res.status(200)
            .json(new ApiResponse(200,
                [],
                "No subscribed channel found"))
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: {
                    $in: channelId.map(
                        (id) => new mongoose.Types.ObjectId(id)
                    )
                }
            }
        },
        {
            $match: {
                isPublic: true
            }
        },
        {
            $sort: {
                createdAt: sortType === "asc" ? -1 : 1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
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
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
            }
        }
    ]);

    if (!videos) {
        throw new ApiError(404, "Error while retrived video")
    }

    return res.status(200)
        .json(new ApiResponse(200,
            videos,
            "Subscribed videos retrived successfully"));
});


//toggle published status function
const togglePublishedStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video Id")
    }

    const videos = await Video.findById(videoId)
    if (!videos) {
        throw new ApiError(404, "Video is not found")
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        if (!video) {
            throw new ApiError(401, "You do not have the permission to perform to this action")
        }
    }

    const updatevideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
            isPublished: !video?.isPublished
        },
    },
        {
            new: true
        }
    );

    return res.status(200)
        .json(new ApiResponse(200,
            updatevideo,
            "Video published status updated successfully"));
})



export {
    getAllVideos,
    getDeleteVideo,
    getPublishedAVideo,
    getSubcribedVideos,
    getUpdateVideo,
    getUserVideos,
    getVideoById,
    togglePublishedStatus
};
