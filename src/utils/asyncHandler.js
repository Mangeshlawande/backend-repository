
//  higher order function : accept fun as parameter, return fun
// using promises


/**
 *  asyncHandler used for handling web request 
 * 
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
};

/*

// const asyncHandler = (fn) =>{() =>{}}
// const asyncHandler = (fn) => () => {};
// const asyncHandler = (fn) => async () => {};

const asyncHandler = (fn) => async (req,res,next) => {
    try {
       return await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
 }
    */

 

   export { asyncHandler }
   //it's a wrapper function utility which use everywhere.

