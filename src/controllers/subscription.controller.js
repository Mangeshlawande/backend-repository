import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import {Subscription } from '../models/subscription.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler( async (requestAnimationFrame, res) => {
    const {channelId} = req.params;
    // Todo: toggle Subscription

});

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId } = req.params;
    // 
});

const getUserSubscribedChannels = asyncHandler(async (req, res) =>{
const {subscriberId} = req.params;

});

export {
    toggleSubscription,
    getChannelSubscribers,
    getUserSubscribedChannels,
    
}