import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id
    //TODO: toggle like on video
    // validate user
    // validate video id
    // Check liked or not
    // toggle the like button

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const video = await Like.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const userHasLiked = video.likes.includes(userId);
    if (!userHasLiked) {
        video.likes.push(userId)
    } else {
        video.likes = video.likes.filter(id => id.toString() !== userId.toString())
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            userHasLiked ? "Like removed successfully" : "Like added successfully",
            { video }
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const comment = await Like.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const userHasLiked = comment.likes.includes(userId);
    if (!userHasLiked) {
        comment.likes.push(userId)
    } else {
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString())
    }

    await comment.save()

    res.status(200).json(
        new ApiResponse(
            200,
            userHasLiked? "Like removed successfully" : "Like added successfully",
            { comment }
        )
    )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const tweet = await Like.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const userHasLiked = tweet.likes.includes(userId);
    if (!userHasLiked) {
        tweet.likes.push(userId)
    } else {
        tweet.likes = tweet.likes.filter(id => id.toString() !== userId.toString())
    }

    await tweet.save()

    res.status(200).json(
        new ApiResponse(
            200,
            userHasLiked? "Like removed successfully" : "Like added successfully",
            { tweet }
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const likes = await Like.find({ likes: userId })
    res.status(200).json(
        new ApiResponse(
            200,
            "Liked videos",
            likes
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}