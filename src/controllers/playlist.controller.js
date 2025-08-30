import mongoose,{isValidObjectId} from "mongoose";
import {Playlist} from '../models/playlist.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    //todo: create playlist
    const {title, description } = req.body;

});

const getUserPlaylists = asyncHandler( async(req, res) =>{
    const {userId } = req.params;
    // get user playList;

});

const getPlaylistById = asyncHandler(async(req, res) =>{
    const {playlistId }=req.params;
    // get playlist by id 

});

const addVideoToPlaylist = asyncHandler(async (req,res) =>{
     const {playlistId, videoId}=req.params;
    //

});

const removeVideoFromPlaylist = asyncHandler(async(req,res) =>{
    const {playlistId, videoId}=req.params;
    // remove video from playlist

});

const updatePlaylist = asyncHandler(async(req,res) =>{
    const {playlistId} = req.params;
    //update playlist;

})

const deletePlaylist = asyncHandler(async(req, res) =>{
    const {playlistId} = req.params;
    // delete playlist 

});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
};