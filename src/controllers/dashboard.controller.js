import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStatus = asyncHandler(async (req, res) => {
    //TODO:  get the channel status like total video, total subscriber, total views, total likes.
    const userId = req.user._id;

    if (!userId.trim()) {
        throw new ApiError(400, "userId not found");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user id");
    }

    // total videos
    const totalVideos = await Video.countDocuments({
        owner: userId,
    });

    if (!totalVideos) {
        throw new ApiError(500, "Failed to get total videos");
    }

    const totalSubscribers = await Subscription.countDocuments({
        owner: userId,
    });

    if (!totalSubscribers) {
        throw new ApiError(500, "Failed to get total subscribers");
    }

    // total likes 
    const totalLikes = await Like.countDocuments({
        likedBy: userId
    })

    if (!totalLikes) {
        throw new ApiError(500, "Failed to get total likes")
    }


    // total views 
    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])
    if (!totalViews) {
        throw new ApiError(500, "Failed to get total views")
    }

    // total comments
    const totalComments = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: false  // exclude videos with no comments
            }
        },
        {
            $count: "totalComments"
        }
    ]);

    if (!totalComments) {
        throw new ApiError(500, "Failed to get total comments")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            {
                totalVideos: totalVideos,
                totalSubscribers: totalSubscribers,
                totalLikes: totalLikes,
                totalViews: totalViews[0].totalViews,
                totalComments: totalComments[0].totalComments
            }, "Channel stats fetched successfully"))

});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO : GET all videos uploaded by channel
    const userId = req.user._id;

    if (!userId?.trim()) {
        throw new ApiError(400, "User ID is required ");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format !!");
    };

    // fetch videos
    const videos = Video.find({ owner: userId }).populate("owner", "fullName  username avatar email");

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }
    // success response
    return res.status(200).json(
        new ApiResponse(
            201,
            videos,
            "Channel videos Retrived successfully"
        )
    );
});

export {
    getChannelStatus,
    getChannelVideos,
}
