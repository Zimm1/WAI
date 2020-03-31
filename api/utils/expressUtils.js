const {validationResult} = require('express-validator');

const ERROR_CODES = {
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    422: "Unprocessable Entity",
    500: "Internal Server Error"
};

function sendError(res, code, message) {
    console.log(message);

    res.status(code).json({
        success: false,
        code: code,
        message: message || ERROR_CODES[code] || ""
    });
}

function checkValidation(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 422, errors.array()[0].msg);
        return;
    }

    next();
}

module.exports = {
    sendError,
    checkValidation
};