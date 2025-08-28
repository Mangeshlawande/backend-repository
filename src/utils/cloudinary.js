/**
 *assumption :  file already upload  on server
 store in local path and then upload on third party,
 then remove from local path. 
 
 */


// custom naming
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("Error : Localfile Path not exist !!");
        }
        // file upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: `Backend/usersFiles`, // Use 'asset_folder' in dynamic mode
            use_filename: true, // Optional: Use the original filename
        });
        //file has been successfully uploaded successfully.
        console.log("File is uploaded on cloudinary !! ");
        console.log("Path : ", response.url);

        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        // remove files from our server if operation failed,
        return null;
    }
};


let deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
        console.log("Deleted From Cloudinary. Public Id :", publicId);
        
    } catch (error) {
       console.log("Error Deleting from cloudinary", error);
       return null
        
    }
}


export { uploadOnCloudinary, deleteFromCloudinary}