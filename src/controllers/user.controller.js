import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) =>{
    return res.status(201).json({
        success: true,
        message: "created",

    })
});


export {
    registerUser,

}