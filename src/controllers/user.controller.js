import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password, } = req.body;

    if (
      [username, email, fullname, password].some((field) => 
        typeof field !== 'string'|| field?.trim() === "")
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


    const avatar = await uploadOnCloudinary(avatarLocalPath );
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


export {
    registerUser,
}