import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({
    path: './.env'
})


//database connection
connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`)
    })
    app.on("error", (err) => {
        console.log("Error: ", err);
        throw err
    })

}).catch((err) => {
    console.log("Database connection is faild !! ", err);
})


