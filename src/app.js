import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended:true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./Routes/user.routes.js";
import videoRouter from "./Routes/video.routes.js"
import tweetRouter from "./Routes/tweet.routes.js"
// import subscriptionRouter from "./Routes/subscription.routes.js"
import commentRouter from "./Routes/comment.routes.js"
// import likeRouter from "./Routes/likes.routes.js"
// import dashboardRouter from "./Routes/dashboard.routes.js"
// import playlistRouter from "./Routes/playlist.routes.js"
// import healthcheckRouter from "./Routes/healthchek.routes.js"


//routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/tweet', tweetRouter)
// app.use('api/v1/subscriber', subscriptionRouter)
app.use('/api/v1/comment', commentRouter)
// app.use('/api/v1/like', likeRouter)
// app.use('/api/v1/dashboard', dashboardRouter)
// app.use('/api/v1/playlist', playlistRouter)
// app.use('/api/v1/healthcheck', healthcheckRouter)

export { app };
