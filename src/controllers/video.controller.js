import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = query ? { title: new RegExp(query, "i") } : {};
    if (userId && isValidObjectId(userId)) {
        filter.userId = userId;
    }

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            {
                message: "Videos fetched successfully",
                videos,
                page,
                totalPages: Math.ceil(total / limit),
            }
        )
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, userId } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid user ID")
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const localVideoPath = await uploadOnCloudinary(req.file.path, title)

    const video = new Video({
        title,
        description,
        thumbnail: localVideoPath.secure_url,
        userId: user._id
    })

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            {
                message: "Video published successfully",
                video
            }
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video ID")
    }

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    // Using aggregation pipeline to fetch video along with user details
    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) }, // Match the specific video by ID
        },
        {
            $lookup: {
                from: "users", 
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $unwind: "$userDetails" }, // Flatten the userDetails array
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                createdAt: 1,
                "userDetails.name": 1, // Include only specific fields from the userDetails
                "userDetails.email": 1,
            },
        },
    ]);

    // Check if video was found
    if (!video.length) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse({
            message: "Video fetched successfully",
            video: video[0], // Return the single video object
        })
    );

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video ID");
    }

    // Validate request user
    if (!req.user?._id) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ensure user owns the video
    if (video.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // Update video details
    const updatedVideo = await Video.findByIdAndUpdate(videoId, req.body, { new: true });
    
    return res.status(200).json(
        new ApiResponse({
            message: "Video updated successfully",
            video: updatedVideo,
        })
    );

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video ID");
    }

    // Validate request user
    if (!req.user?._id) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ensure user owns the video
    if (video.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete video
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse({
            message: "Video deleted successfully",
        })
    );
 
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video ID");
    }

    // Validate request user
    if (!req.user?._id) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ensure user owns the video
    if (video.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse({
            message: "Video status updated successfully",
            video,
        })
    );
 
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}