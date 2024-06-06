const logger = require('../utils/logger');

/* eslint no-else-return: 0, consistent-return: 0 */
const errorHandler = (error, req, res, next) => {
    logger.error(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message });
    } else if (
        error.name === 'MongoServerError' &&
        error.message.includes('E11000 duplicate key error')
    ) {
        return res
            .status(400)
            .send({ error: 'expected username to be unique' });
    } else if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: 'token invalid' });
    }
    next(error);
};

module.exports = errorHandler;
