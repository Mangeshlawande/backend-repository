import mongoose, {isValidObjectId} from "mongoose";
import {Like} from '../models/like.model.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleCommentLike = asyncHandler(async (req,res) =>{
    //toggle like on comments
    const {commentId} = req.params;

});

const toggleTweetLike = asyncHandler(async(req, res) =>{
    //toggle like on tweet

});
const toggleLikedVideos = asyncHandler(async(req,res) => {
    //todo : get all liked videos 
});