const ERROR_CODES = {
    400: "Bad Request",
    404: "Not Found",
    500: "Internal Server Error"
};

function sendError(res, code) {
    res.status(code).json({
        success: false,
        code: code,
        message: ERROR_CODES[code] || "Error"
    });
}

module.exports = {
    sendError
};