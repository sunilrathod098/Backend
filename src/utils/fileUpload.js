import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configure on cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//upload image to cloudinary function
const uploadOnCloud = async (filePath) => {
    try {
        if (!filePath) return null
        //upload the   file on cloudinary
        const fileResponse = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        })
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary ", Response.url);
        fs.unlinkSync(filePath)
        return fileResponse;

    } catch (error) {
        // Remove the local temporary file if the upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error("Error uploading to Cloudinary: ", error);
        return null;
    }
}

export { uploadOnCloud };