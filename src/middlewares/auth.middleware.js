import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

/**
 *  we can add user object in side request 
    how to get accesToken 
    --> req.cookie from cookies-pareser middleware
    --> cookies not there (mobile app)
    --> check  for custom header
    postman 
        header 
            authorization : Bearer "token_string" 

        to extract token from header remove Bearer  

 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    // 
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request !!");
        };

        // verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            // todo : discuss about Front end
            throw new ApiError(401, "Invalid Access Token");
        };
        // add user obj in req 
        req.user = user;
        next()


        // majorly used in routes   
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
});

// next  router 