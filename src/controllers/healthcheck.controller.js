import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler( async (req, res) => {

    const healthCheckResponse = {
        message: "OK",
        status: 200,
    }

    return res.status(200)
    .json(new ApiResponse(200,
        healthCheckResponse,
        "OK"
    ));
});

export { healthCheck };
