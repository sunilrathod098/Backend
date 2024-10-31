import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`server running on http://localhost:${process.env.PORT}`)
    })
}).catch((err) => {
    console.log("Database connection is faild !! ", err);
})







