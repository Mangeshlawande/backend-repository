import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query;

});

const publishAVideo = asyncHandler(async(req, res) =>{
    const { title, description } = req.body;
    //Todo: get a video , upload to cloudinary, create video,

});

const getVideoById = asyncHandler( async (req, res) =>{
    const {videoId} = req.params
    //TODO: GETVIDEObYiD;

});

const updateVideo = asyncHandler( async(req, res) =>{
    const {videoId } = req.params;
    //TODO: update video details like title, description, thumbnail

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
