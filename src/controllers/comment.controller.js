import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const { page = 1, limit = 10 } = req.query
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
    
    return res.status(200).json(
        new ApiResponse(
            200,
            "Comments retrieved successfully",
            {comments, page, limit}
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { commentText, userId } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    if (!commentText) {
        throw new ApiError(400, "Comment text is required")
    }

    const newComment = await Comment.create({
        videoId,
        commentText,
        userId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            "Comment added successfully",
            newComment
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { commentText, userId } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    if (!commentText) {
        throw new ApiError(400, "Comment text is required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { commentText },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Comment updated successfully",
            updatedComment
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    const { userId } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Comment deleted successfully",
            deletedComment
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}