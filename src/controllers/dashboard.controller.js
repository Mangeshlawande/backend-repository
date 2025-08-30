import mongoose  from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStatus = asyncHandler(async(req, res) =>{
    //TODO:  get the channel status like total video, total subscriber, total views, total likes.
});


const getChannelVideos = asyncHandler(async ( req,res) => {
// TODO : GET all videos uploaded by channel

});

export {
    getChannelStatus,
    getChannelVideos,
}
