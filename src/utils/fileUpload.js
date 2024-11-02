import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configure on cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloud = async (filePath) => {
    try {
        if (!filePath) return null
        //upload thr file on cloudinary
        const fileResponse = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        })
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary ", Response.url);
        fs.unlinkSync(filePath)
        return fileResponse;

    } catch (error) {
        fs.unlinkSync(filePath)/*remove the localy saved temp file 
        as the upload operation dot failed*/
        return null;
    }
}

export { uploadOnCloud };
