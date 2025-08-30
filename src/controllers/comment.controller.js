import mongoose, {isValidObjectId} from "mongoose";
import {Comment} from '../models/comment.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async(req, res)=>{
    // TODO: get all comment for a video;
    const {videoId} = req.params;
    const {page = 1, limit = 10 }= req.params;

});

const addComment = asyncHandler(async(req, res) =>{
    // TODO: add a comment to a video ;
        const {videoId} = req.params;


});

const updateComment = asyncHandler(async(req, res) =>{
    //TODO: UPDATE A COMMNET 
});

const deleteComment = asyncHandler(async(req, res) =>{
    //Todo: delete comments.
});

