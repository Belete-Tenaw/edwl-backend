const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.error("Global Error Handler caught:", {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });

    // Catch Multer errors specifically
    if (err.name === 'MulterError' || err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size allowed is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    // Handle SyntaxError (JSON parsing errors)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Bad JSON format' });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
