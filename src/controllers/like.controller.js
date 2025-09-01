import mongoose, { isValidObjectId } from "mongoose";
import { Like } from '../models/like.model.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleCommentLike = asyncHandler(async (req, res) => {
    //toggle like on comments
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!userId.trim()) {
        throw new ApiError(401, "user is not authenticated to liked by comment ");
    }
    if (!commentId.trim()) {
        throw new ApiError(400, "commnet id is required !");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id ");
    }

    //check if user is already like the comment 
    const existedLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });

    // if like does exist, toggle it.
    if (existedLike) {
        const commentLike = await Like.findOneAndDelete(existedLike._id);
        if (!commentLike) {
            throw new ApiError(500, "failed to unlilke comment");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, "comment unliked successfully")
            )
    }
    // if like not exist , create it .
    const like = await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    if (!like) {
        throw new ApiError(404, "Failed to toggle like.");
    }
    return res.status(200).json(new ApiResponse(201, like, "toggle comment successfully"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    //toggle like on tweet
    const { tweetId } = req.params;

    if (!tweetId.trim()) {
        throw new ApiError(400, "tweet id is required !!");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid tweetId");
    }

    const userId = req.user._id;

    if (!userId?.trim()) {
        throw new ApiError(400, "userId is required")
    }

    //check if the user has already liked the tweet
    const existedLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    //if like does exist, toggle it
    if (existedLike) {
        const tweetLike = await Like.findByIdAndDelete(existedLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, tweetLike, "Tweet unliked successfully"))
    }

    //if like does not exist, create it
    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    if (!like) {
        throw new ApiError(500, "Failed to toggle like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Tweet liked successfully"))



});

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // toggle like on videos

    if (!videoId.trim()) {
        throw new ApiError(400, "video id is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId !!");
    };

    const userId = req.user._id;

    // check if user is already like;
    const existedLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    // if exist delete it
    if (existedLike) {
        await Like.findByIdAndDelete(existedLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video unliked successfully"))
    }

    // if not exist create it.
    const like = Like.create({
        video: videoId,
        likedBy: userId,
    });

    if (!like) {
        throw new ApiError(500, "Failed to toggle like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Video liked successfully"))

});

const getLikedVideos = asyncHandler(async (req, res) => {
    //todo : get all liked videos 
    const userId = req.user._id;

    if (!userId.trim()) {
        throw new ApiError(400, "user id not found !!");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user id !!");
    }

    // Find all likes by this user, and populate video details
    const likedVideos = Like.find({ likedBy: userId }).populate("video").exec();

    // Extract only video objects from likedVideos
    const videos = likedVideos.map(like => like.video);

    return res.status(200).json( new ApiResponse(201, videos, "fetch all videos successfully"));

});
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
}