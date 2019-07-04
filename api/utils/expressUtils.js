const ERROR_CODES = {
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error"
};

function sendError(res, code, message) {
    res.status(code).json({
        success: false,
        code: code,
        message: message || ERROR_CODES[code] || "Error"
    });
}

module.exports = {
    sendError
};