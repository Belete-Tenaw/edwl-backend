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

    // Handle Prisma Errors
    if (err.name === 'PrismaClientKnownRequestError') {
        // P2002: Unique constraint violation
        if (err.code === 'P2002') {
            const field = err.meta?.target ? err.meta.target.join(', ') : 'field';
            return res.status(409).json({ error: `An account with this ${field} already exists.` });
        }
        // P2025: Record not found
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Record not found.' });
        }
    }

    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({ error: 'Invalid data provided.' });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        error: err.name || 'ServerError',
        message: err.message || 'An unexpected error occurred.',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
