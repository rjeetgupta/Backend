import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const { userId } = req.user;

    // Get total subscribers
    const totalSubscribers = await User.countDocuments({ subscribedChannels: userId });

    // Get total videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ userId });

    // Get total video views (sum of views from all videos of the channel)
    const totalViews = await Video.aggregate([
        {
            $match: { userId }
        },
        {
            $group: { _id: null, totalViews: { $sum: "$views" } }
        },
    ]);

    // Get total likes for the channel (sum of likes across all videos)
    const totalLikes = await Video.aggregate([
        {
            $match: { userId }
        },
        {
            $group: { _id: null, totalLikes: { $sum: "$likes" } }
        },
    ]);

    // Return the channel stats
    return res.status(200).json(
        new ApiResponse(
            true,
            "Channel stats retrieved successfully",
            {
                totalSubscribers,
                totalVideos,
                totalViews: totalViews[0]?.totalViews || 0,
                totalLikes: totalLikes[0]?.totalLikes || 0,
            }
        )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const { userId } = req.user; // assuming user is authenticated and `userId` is available in the request
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    const skip = (page - 1) * limit;

    // Get all videos uploaded by the channel (pagination, sorting, and field selection)
    const videos = await Video.aggregate([
        {
            $match: { userId }
        }, // Match videos by the user (channel)
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1, // Sorting based on the provided query parameters
            },
        },
        { $skip: skip }, // Pagination: Skip videos based on the current page
        { $limit: limit }, // Limit the number of videos per page
    ]);

    if (!videos || videos.length === 0) {
        return res.status(404).json(
            new ApiResponse(
                false,
                "No videos found for this channel",
                []
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            true,
            "Videos fetched successfully",
            videos
        )
    );
})

export {
    getChannelStats, 
    getChannelVideos
}