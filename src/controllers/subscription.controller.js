import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from '../models/subscription.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (requestAnimationFrame, res) => {
    const { channelId } = req.params;
    // Todo: toggle Subscription
    if (!channelId?.trim()) {
        throw new ApiError(404, "Channel id is required")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    let subscriber = undefined
    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id,
    });
    // If the user is already subscribed, unsubscribe them

    if (existingSubscription) {
        subscriber = await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new ApiResponse(200, subscriber, "Unsubscribed successfully"));
    }
    // If the user is not subscribed, subscribe them
    else {
        subscriber = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id,
        });
    }

    if (!subscriber) {
        throw new ApiError(500, "Failed to toggle subscription");
    }

    return res.status(200).
        json(new ApiResponse(200, subscriber, "Subscripe  successfully"));


});

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // 
    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel id is required")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    })

    if (!subscribers) {
        throw new ApiError(404, "No subscribers found")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers of fetched successfully"))

});

const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = channelId
    console.log("subscriberId", req.params)
    console.log("subscriberId", subscriberId)

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "Subscriber id is required")
    }
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const subscriptions = await Subscription.find({
        subscriber: subscriberId,
    })

    if (!subscriptions) {
        throw new ApiError(404, "User has not subscribed to any channels")
    }

    res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    )

});

export {
    toggleSubscription,
    getChannelSubscribers,
    getUserSubscribedChannels,

}