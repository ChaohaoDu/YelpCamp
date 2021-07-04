class ExpressError extends Error {
    constructor(messages, statusCode) {
        super();
        this.message =messages;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;