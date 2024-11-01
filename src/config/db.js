import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//here we use async function and await prommiese
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose
        .connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // connect database url with db_name 
        console.log(`\n Database connect successfully!! \n DB HOST: ${connectionInstance.connection.host}`) //showing here host name also
    
    } catch (err) {
        console.err("Database connection is faild:", err);
        process.exit(1) // this line is indicates that the process exited with an error or failure.
    }
}

//the databse connection is default connection.
export default connectDB