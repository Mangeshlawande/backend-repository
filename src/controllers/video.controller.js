import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
    //TODO: get all videos based on query;

    if (!userId) {
        throw new ApiError(400, "user_Id required !!");
    };

    try {

        const existedUser = await User.findById(userId);
        if (!existedUser) {
            throw new ApiError(404, "user not Found  !!");
        };

        // convert page & limit to number.
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // build an aggregation pipeline

        const user = await User.aggregate([
            {
                //Match user by userId;
                $match: {
                    _id: new mongoose.Types.ObjectId(userId),
                }
            },
            {
                //lookup videos owned by user
                $lookup: {
                    from: "videos", //collection name in mongodb
                    localField: "_id", //field in the user collection
                    foreignField: "owner", // field in videos  collection
                    as: "videos", // alias for join data
                }
            },
            {
                //unwind the vidos array to process each video individually.
                $unwind: "$videos"
            },
            {
                //Apply filtering based on query(search by title)
                $match: {
                    ...(query && { "videos.title": { $regex: query, $options: "i" } }) // Case-insensitive search
                }
            },
            {
                // Sort the videos based on the sortBy and sortType parameters
                $sort: {
                    [`videos.${sortBy}`]: sortType === "asc" ? 1 : -1 // asc or desc order
                }
            },
            {
                //skip docs for pagination
                $skip: (pageNumber - 1) * limitNumber
            },
            {
                //limit the number of documents returned
                $limit: limitNumber
            },
            {
                // Regroup the videos into an array after processing
                $group: {
                    _id: "$_id",
                    videos: { $push: "$videos" },
                }
            }
        ]);

        // Handle cases where no videos are found
        if (!user.length) {
            throw new ApiError(404, "No videos found");
        }

        // Extract the videos array from the aggregation result
        const videos = user[0].videos;

        // Send the response with pagination details
        return res.status(200).json(
            new ApiResponse(200, {
                currentPage: pageNumber,
                totalVideos: videos.length,
                videos,
            }, "Videos fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, error?.message || "network error",)
    }
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    //Todo: get a video , upload to cloudinary, create video,

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description both are required !!");
    }

    if (!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    let videoFileLocalPath;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0]?.path;
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    let thumbnailLocalPath = req.files.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required");
    }

    try {
        const videoUpload = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    } catch (error) {
        throw new ApiError(502, "Bad Gateway: Uploading failed from upstream Cloudinary server :");
    };
    console.log("video :", videoUpload);

    const video = await Video.create({
        title: title,
        description: description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: req.user?._id,
        ispublished: true,
        duration: videoUpload.duration,
        views: 0
    });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video published successfully"))
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: GETVIDEObYiD;

    if (!videoId.trim()) {
        throw new ApiError(400, "videoId is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(201, video, "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, videoFile

    if (!videoId.trim()) {
        throw new ApiError(400, "VideoId is Missing !!");
    }
    existedVideo = await Video.findById(videoId);

    if (!existedVideo) {
        throw new ApiError(404, "Video not found")
    }

    const prevUrl = existedVideo.url;
    // const coverImage = await uploadOnCloudinary(coverLocalPath);

    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title, description and videFile are required")
    };

    const vidPath = req.file?.path;

    const videoFileRes = await uploadOnCloudinary(vidPath);

    const match = prevUrl.match(/upload\/v\d+\/([^\.]+)/);

    if (match) {
        const publicId = match[1];
        await deleteFromCloudinary(publicId);
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            title: title,
            description: description,
            videoFile: videoFileRes.url,
            duration: videoFileRes.duration,
            views: 0,
        },
        {
            new: true
        }
    );


    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))



});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId.trim()) {
        throw new ApiError(400, "videoId is required");
    }

    try {

        const isVideoExisted = await Video.findById(videoId);

        if (!isVideoExisted) {
            throw new ApiError(404, "Video not found")
        };
        const video = await Video.findByIdAndDelete(videoId);
        if (!video) {
            throw new ApiError(404, "Video Not Found !!");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video deleted successfully"))

    } catch (error) {
        throw new ApiError(500, error?.message || "server Error ");
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId.trim()) {
        throw new ApiError(400, "videoId not found");
    }

    const video = Video.findByIdAndUpdate(videoId,
        {
            $set: {
                ispublished: !video.ispublished,

            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video publish status updated successfully"));

})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
