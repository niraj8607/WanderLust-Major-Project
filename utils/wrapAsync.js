// This function wraps asynchronous route handlers to catch any errors
// and pass them to the next middleware (your error handler).
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};