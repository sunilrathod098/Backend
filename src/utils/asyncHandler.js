// in this code we use promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }

    ////this code also working without promises
    //     requestHandler(req, res, next).catch((err) => {
    //         next(err)
    // })
}


// //this code is working as same as above code but we use try & catch method
// const asyncHandler = (fn) => async () => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export { asyncHandler }
