import  { isValidObjectId } from "mongoose";
import { Playlist } from '../models/playlist.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../controllers/video.controller.js";


const createPlaylist = asyncHandler(async (req, res) => {
    //todo: create playlist
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and description both are required");
    }

    if (!isValidObjectId(req.user._id)) {
        throw new ApiError(400, "Invalid user id")
    }

    const playlist = await Playlist.create({
        name: title,
        description: description,
        owner: req.user._id,
        videos: [],
    });

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res.status(201).json(
        new ApiResponse(201, playlist, "playlist created successfully")
    );

});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // get user playList;
    if (!userId?.trim()) {
        throw new ApiError(401, "user id is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    try {
        const playlists = await Playlist.find({
            owner: userId,
        }).populate("videos");

        if (!playlists || playlists.length === 0) {
            throw new ApiError(404, "No playlists found")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))

    } catch (error) {
        throw new ApiError(500, error?.message || "unable to fetch playlist, server error");
    }
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // get playlist by id 

    if (!playlistId.trim()) {
        throw new ApiError(404, "playlist id not found !!")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id !");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    //

    if ([playlistId, videoId].some((field) => !field?.trim())) {
        throw new ApiError(404, "Playlist id and video id are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "playlist id not found !! ");
        }

        // check video exist or not 
        const videoExist = await Video.findById(videoId);
        if (!videoExist) {
            throw new ApiError(404, "Video not found !!");
        }

        // check video already in playlist or not
        const videoInPlaylist = await playlist.videos.some((video) => video._id.toString() === videoId);

        if (videoInPlaylist) {
            throw new ApiError(400, "Video already exists in playlist !! ");
        }

        playlist.videos.push(videoId);
        const updatedPlaylist = await playlist.save();

        if (!updatedPlaylist) {
            throw new ApiError(500, "Failed to add video in playlist");
        }
        console.log("updatedPlaylist", updatedPlaylist);
        //populate  videos in playlist 

        const populatedPlaylist = await updatedPlaylist.populate("videos");
        if (!populatedPlaylist) {
            throw new ApiError(500, "Failed to populate videos in playlist")
        }

        console.log("populatedPlaylist", populatedPlaylist)
        // return response

        return res.status(200).json(
            new ApiResponse(201, populatedPlaylist, "video added to playlist successfully ")
        );

    } catch (error) {
        throw new ApiError(500, error?.message || "failed to add video in playlist ");
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // remove video from playlist
    if ([playlistId, videoId].some((field) => !field?.trim())) {
        throw new ApiError(404, "Playlist id and video id are required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found !!");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    //check video already is exist or not
    const existedVideo = playlist.videos.some((video) => video?._id.toString() === videoId);

    if (!existedVideo) {
        throw new ApiError(404, "Video not found  in  playlist !!");
    }

    try {
        //remove video from playlist
        playlist.videos = playlist.videos.filter((video) => video._id.toString() !== videoId);
        const updatedPlaylist = await playlist.save();
        if (!updatedPlaylist) {
            throw new ApiError(500, "Failed to remove video from playlist ");
        }

        //populate videos in playlist
        const populatedPlaylist = await populatedPlaylist.populate("videos");
        if (!populatedPlaylist) {
            throw new ApiError(500, "Failed to populate videos in playlist")
        }

        // return response
        res
            .status(200)
            .json(new ApiResponse(
                200,
                populatedPlaylist,
                "Video removed from playlist successfully"
            ))
    } catch (error) {
        throw new ApiError(500, error?.message || "Server Error ");

    }
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //update playlist;
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(404, "Both title and description required !");
    }

    if (!playlistId.trim()) {
        throw new ApiError(404, "playlist id is required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id");
    }

    try {
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                name: title,
                description: description,
            },
            {
                new: true,
                runValidators: true
            }
        );
        if (!playlist) {
            throw new ApiError(404, "playlist not found ");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    201,
                    playlist,
                    "playlist Updated successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to Update playlist. ");
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // delete playlist 
    if (!playlistId.trim()) {
        throw new ApiError(400, "playList id is required !")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id");
    }

    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId);

        if (!playlist) {
            throw new ApiError(404, "playlist not Found !!");
        }

        return res
            .status(200)
            .json(new ApiResponse(
                201,
                playlist,
                "PlayList deleted successfully "
            ))

    } catch (error) {
        throw new ApiError(500, error?.message || "Server Error : Failed to delete playlist");
    }
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