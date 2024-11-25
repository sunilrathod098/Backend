import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



//this is work toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    //debug
    // if(!req.params){
    // console.log("user channel from params:", !req.params)
    // }
    // console.log("channel id: ", channelId)

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id");
    }

    if (channelId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Cannot subscribe your own channel");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    //debug
    // console.log("isSubscribed status: ", isSubscribed)

    if (isSubscribed) {
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed)

        if (!unsubscribe) {
            throw new ApiError(500, "Error while Unsubscrbing")
        }
    } else {
        const subscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        if (!subscribe) {
            throw new ApiError(500, "Error while subscribing")
        }
    }

    return res.status(200)
        .json(new ApiResponse(200,
            {},
            "Subscription toggled successfully"));
});


//user channel subscribers function
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // console.log("Inside getUserChannelSubscribers Controller");

    // console.log(req.params)

    const { channelId } = req.params;

    //debug
    // console.log(req.params)
    // console.log("Channel Id:", channelId)
    
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id");
    }

    const channelExists = await Subscription.findOne({ channel: channelId });
    if (!channelExists) {
        throw new ApiError(404, "channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
            }
        },
        {
            $unwind: {
                path: "$subscriberDetails",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $group: {
                _id: null,
                subscribers: { $push: "$subscriberDetails" },
                totalSubscribers: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                subscribers: {
                    _id: 1,
                    username: 1,
                    avatar: 1,
                    fullName: 1,
                },
                subscriberCount: "$totalSubscribers",
            }
        }
    ]);

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(400, "Subscribers not found")
    }

    return res.status(200)
        .json(new ApiResponse(200,
            subscribers[0],
            "Subscribers retrieved successfully"));
})


//this function is a subscriber channel
const getSubscriberChannel = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    //debug
    // console.log(req.params)
    // console.log(subscriberId)

    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "No valid subscriber Id found")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "channel",
                foreignField: "channel",
                as: "channelSubscribers"
            }
        },
        {
            $addFields: {
                "channelDetails.isSubscribed": {
                    $cond: {
                        if: {
                            $in: [
                                new mongoose.Types.ObjectId(req.user?._id),
                                "$channelSubscribers.subscriber",
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                "channelDetails.subscribersCount": {
                    $size: "$channelSubscribers",
                },
            }
        },
        {
            $group: {
                _id: null,
                channels: { $push: "$channelDetails" },
                totalChannels: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                channels: {
                    _id: 1,
                    isSubscribed: 1,
                    subscriberCount: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                },
                channelsCount: "$totalChannels"
            }
        }
    ]);

    if (!subscribedChannels || subscribedChannels === 0) {
        throw new ApiError(404, "Channels are not found")
    }

    return res.status(200)
        .json(new ApiResponse(200,
            subscribedChannels[0],
            "Subscribed channel retrived successfully"));
});


export {
    getSubscriberChannel,
    getUserChannelSubscribers,
    toggleSubscription
};
