import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // If the error is not already an instance of ApiError, create a generic one
    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error ";
        error = new ApiError(statusCode, message, error?.errors, error?.stack )
    };

        // Prepare the error response

    const response = {
        ...error,
        message:error.message,
        ...(process.env.NODE_ENV==="developement" ? { stack : error.stack} : {}),
        // // Send stack trace only in development
    };

      // Log the error for debugging
    console.error(`[Error] ${error.message}`);

    // send the json response;
    return res.status(error.statusCode).json(response);
};

export { errorHandler };