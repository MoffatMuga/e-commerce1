//not found

const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.OriginalUrl}`);
    res.status(404)
    next(error)
}

// errorHandler

const errorHandler = (err, req, res) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode)
    res.json({
        msg: err?.message,
        stack: err?.stack

    })
}

module.exports = { notFound, errorHandler }