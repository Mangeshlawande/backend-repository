import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation refresh and access token.")
    }
};

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password, } = req.body;

    if (
        [username, email, fullname, password].some((field) =>
            typeof field !== 'string' || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required and must be non-empty strings");
    }

    //email formatting check @ is there or not 
    if (!(email.includes("@"))) {
        console.error("Error : @ is missing in email field !!",);// console error
        throw new ApiError(400, "Error : @ is missing in email field !!");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "Username with email or username already exist !");
        // 409 : conflict error
    }

    console.log(existedUser);
    /**
     * using req.files, bcoz from multer we takes array of files i.e fields( [{name:avatar}, {} ] )
     from we get name property
     */

    // multer middleware gives access to files  : req.files

    const avatarLocalPath = req.files?.avatar[0]?.path; //it is on the server
    // console.log(req.files);

    const coverImageLocalPath = req.files.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required ")
    }

    // db in in another location

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user ");
    };

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Register Successfully !!")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    try {
        /* 
        req.body -> data
        username or email
        find the user 
        password check
        access and refresh token
        send through cookies
        User --> mongoose object 
        user --> available custome method like refresh-access-token
        */

        const { username, email, password } = req.body;

        if (!email && !username) {
            throw new ApiError(400, "username or email is required !!");
        };

        const user = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            throw new ApiError(404, "User not exist");
        };

        const isValidPassword = await user.isPasswordCorrect(password);

        if (!isValidPassword) {
            throw new ApiError(404, "Invalid user credentials !!");
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true, // modify from server only.
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    201,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                        // if user want to save these tokens in localstorage, it developed a mobile app ,
                        // not since cookies cannot set  
                    },
                    "User Logged in successfully!! ",
                )
            )




    } catch (error) {

    }
});

const logoutUser = asyncHandler(async (req, res) => {
    /**
     * for logout 
     * clear cookies which is manage by server 
     * clear access  + refresh token 
     * To find user , but whers the users comes from 
     
        - need middleware 
             - define your own middleware ,  for logout 
    
        back to logout user
        get id from req.user
        dbcall set undefined refreshtoken
        with new :true

        in options : clear cookies

     */

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1,
                // remove field from document
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    }
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(201, {}, "User Logged-out successfully")
        )

});

// make an endpoint to refreshtoken to restart session
// Controller to refreshaccesstoken
const refreshAccessToken = asyncHandler(async (req, res) => {
    /**
        get refreshtoken from cookies.
        valildate token 
        verify token
        from decoded-token get _id based on that _id hit query in db , get user
        check incoming refreshtoken and user.refreshtoken from db is same.
     */

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request !!");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        // from decoded-token get _id based on that _id hit query in db , get user
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid RefreshToken !!");
        };
        // validate both token 
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refreshtoken is expired or used ");
        }

        // for cookies options reqrd , can make it global
        const options = {
            httpOnly: true,
            secure: true
        };

        // generate new token ,
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        newRefreshToken,
                    },
                    "Access Token refreshed !!"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    /**
     * get old and new password
     * required user to verify password , get from verifyjwt
     * 
     */
    const { oldPassword, newPassword } = req.body;

    /*  const { oldPassword, newPassword, confPassword } = req.body;
        if(!(newPassword === confPassword)){
            throw new ApiError(401 , "Pass not Match")
    } */

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(401, "Invalid user");
        }

        const isValidPassword = user.isPasswordCorrect(oldPassword);
        if (!isValidPassword) {
            throw new ApiError(401, "Invalid Password");
        }

        user.password = newPassword;

        // remaining fields keep as it is, instead of password
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password changed Successfully !!")
        );

    } catch (error) {
        throw new ApiError(401, error?.message || "something went wrong ikn changing password ");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    /**
     * get user from req.user, 
     * return the response 
     */
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    /**
     * get info from req.body
     */
    const { fullname, email, } = req.body;

    if (!(email || fullname)) {
        throw new ApiError(401, "All fields are required !!")
    }

    try {
        const user = await User.findByIdAndUpdate(req.user._id,
            {
                email,
                fullname: fullname,
            }, { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    201,
                    user,
                    "Account Details updated successfully",
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Error : Account details not updated  due to server Error");
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;
    // const user = await User.findById(req.user?._id);
    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar file is missing !");
    }
    try {
        //TODO :Delete old Image --> Assignment 

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar.url) {
            throw new ApiError(404, "Error while uploading avatar ");
        };

        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    avatar: avatar.url,
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Avatar update Successfully !!"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Error : Avatar not updated  due to server Error");
    }
});


const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) {
        throw new ApiError(404, "CoverImage file is missing !");
    }

    try {
        const coverImage = await uploadOnCloudinary(coverLocalPath);

        if (!coverImage.url) {
            throw new ApiError(404, "Error while uploading avatar ");
        };

        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url,
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "coverImage update Successfully !!"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Error : coverImage not updated  due to server Error");
    }

});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    /**
     coverImage, username, profileImage/avatar, fullname
     1. user subscribed to how many chnnels --> 202 subscribed
     2. how many user is subscribed to this channel-->  600k subscribers.
     not stored

     */

    try {

        const { username } = req.params;
        if (!username?.trim()) {
            throw new ApiError(404, "username is Missing");
        };


        // await User.find({username});
        const channel = await User.aggregate([
            {
                $match: { username: username?.toLowerCase(), }
            },
            {
                $lookup: {
                    from: "subscriptions", //lowercase and plural
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                }
            },
            {
                $lookup: {
                    from: "subscriptions", //lowercase and plural
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    isSubscribed: 1,
                    subscribersCount: 1,
                    channelSubscribedToCount: 1,
                }
            }

        ]);
        console.log("channel : ", channel);

        if (!channel?.length) {
            throw new ApiError(400, "channel does not exists")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(201, channel[0], "channel profile fetched successfully")
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "server error while fetching user profile ");
    };

});

const getWatchHistory = asyncHandler(async (req, res) => {
    /**
     aggregation pipeline work directly, explicitly need to convert string id into objectId(req?.user._id);


     */

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner",
                                // $arrayElemAt: "$owner"
                            }
                        }
                    }
                ]
            }
        }

    ]);

    return res.status(200)
    .json(
        new ApiResponse(200,
            user[0].watchHistory, 
            "Watch History fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,

};