import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // take content
    // validate content
    // validate user
    // create tweet
    // send response
    const { tweetContent, userId } = req.body
    if (!tweetContent || tweetContent.length === 0) {
        throw new ApiError(400, "Tweet content cannot be empty")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweet = await Tweet.create({
        content: tweetContent,
        user: userId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    )
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // validate user
    // get tweets
    // send response

    // validate user
    const user = await User.findById(req.user?._id)
    
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({
        user: user._id,
    })

    return res
       .status(200)
       .json(
            new ApiResponse(
                200,
                tweets,
                "Tweets retrieved successfully"
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // take the updated tweet
    // validate user
    // update tweet
    // send response

    const { tweetContent } = req.body;
    const tweetId = req.params.tweetId;
    const userId = req.user?._id;

    // Validate IDs 
    if (!isValidObjectId(tweetId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid ID format");
    }

    if (!tweetContent || tweetContent.length === 0) {
        throw new ApiError(400, "Tweet content cannot be empty")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = tweetContent;
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    );
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // validate user
    // delete tweet
    // send response

    const tweetId = req.params.tweetId;
    const userId = req.user?._id;

    // Validate IDs 
    if (!isValidObjectId(tweetId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid ID format");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet deleted successfully"
        )
    );

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}