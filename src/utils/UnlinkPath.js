import fs from 'fs';

export function unlinkPath(videoLocalPath, thumbnailLocalPath) {
    try {
        if (videoLocalPath && fs.existsSync(videoLocalPath)) {
            fs.unlinkSync(videoLocalPath);
        }
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath);
        }
    } catch (err) {
        console.error("Error deleting files:", err);
    }
}
