import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const { userId } = req.body

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }    

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const channel = await Subscription.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }    

    const userHasSubscribed = channel.subscriber.includes(userId)

    if (!userHasSubscribed) {
        channel.subscriber.push(userId)
    } else {
        channel.subscriber = channel.subscriber.filter(id => id!== userId)
    }

    await channel.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            userHasSubscribed ? "Subscription removed" : "Subscription added",
            { userHasSubscribed: !userHasSubscribed }
        )
    );    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await Subscription.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Subscribers retrieved successfully",
            { subscribers: channel.subscriber }
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }    

    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const channels = await Subscription.find({ subscribers: subscriberId });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Subscribed channels retrieved successfully",
            { subscribedChannels: channels }
        )
    );    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}