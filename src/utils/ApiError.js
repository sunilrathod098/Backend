class ApiError extends Error{
    constructor(
        message = "Something went wrong",
        errors = [],
        statusCode,
        stack = ''
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null,
        this.errors = errors,
        this.message = message,
        this.succes = false

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }
