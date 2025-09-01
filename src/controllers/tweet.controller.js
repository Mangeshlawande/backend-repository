import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from '../models/tweet.model.js'
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req, res) => {
    //todo: create tweet
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required")
    }

    try {
        const tweet = await Tweet.create({
            content: content,
            owner: req.user._id,
        });

        return res
            .status(200)
            .json(
                new ApiResponse(201,
                    Tweet,
                    "Tweet created Successfully !!"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Tweet Creation Failed !!");
    }

});

const getUserTweets = asyncHandler(async (req, res) => {
    //TODO : get user tweets
    const { userId } = req.params

    if (!userId?.trim()) {
        throw new ApiError(404, "User id is required")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    };

    try {
        const user = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "owner",
                    as: "tweets"
                }
            },
            {
                // unwind tweets arrayto get individual tweets.
                $unwind: "$tweets",
            },
            {
                // project the required fields
                $project: {
                    _id: 1,
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    tweets: {
                        _id: "$tweets._id",
                        content: "$tweets.content",
                        createdAt: "$tweets.createdAt",
                        owner: "$tweets.owner"
                    }
                }
            }
        ]);

        console.log(user);
        if (!user?.length) {
            throw new ApiError(404, "User not found!! ");
        }

        return res.status(200).
            json(new ApiResponse(200, user, "User tweets fetched successfully"))



    } catch (error) {
        throw new ApiError(502, error?.message || " Error : Unable to Fetch user Tweets.")
    }

});

const updateTweet = asyncHandler(async (req, res) => {
    //Todo: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId.trim()) {
        throw new ApiError(404, "Tweet id is missing");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    if (!content?.trim()) {
        throw new ApiError(404, "Content is required");
    }
    try {
        const tweet = await Tweet.findByIdAndUpdate(tweetId,
            {
                content: content,
            },
            {
                new: true,
            }
        );

        if (!tweet) {
            throw new ApiError(404, "Tweet not found !");
        };

        return res
            .status(200)
            .json(new ApiResponse(
                201,
                tweet,
                "Tweet updated Successfully !! "
            ));

    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update tweets.");
    }

});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId.trim()) {
        throw new ApiError(404, "tweetId is required !!");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet id");
    }

    try {
        const tweet = await Tweet.findByIdAndDelete(tweetId);

        if (!tweet) {
            throw new ApiError(404, "Tweet not found !!");
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                tweet,
                "Tweet deleted successfully",
            ));

    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to delete tweet.");

    }

});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};
