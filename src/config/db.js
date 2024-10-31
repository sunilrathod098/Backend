import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Database connect successfully!! DB HOST: ${connectionInstance.connection.host}`)
    } catch (err) {
        console.err("Database connection is faild:", err);
        process.exit(1)
    }
}

export default connectDB