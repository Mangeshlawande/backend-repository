import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken';

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

    await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                refreshToken: undefined,
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
   const {accessToken, refreshToken: newRefreshToken}=  await generateAccessAndRefreshTokens(user._id);
 
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


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    
}