const logger = require('./logger');

const requestLogger = (req, res, next) => {
    logger.info('method: ', req.method);
    logger.info('path: ', req.path);
    logger.info('body: ', req.body);
    logger.info('-------');
    next();
};

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

/* eslint no-else-return: 0, consistent-return: 0 */
const errorHandler = (error, req, res, next) => {
    logger.error(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'});
    }
    else if (error.name === 'ValidationError') {
        return res.status(400).send({error: error.message});
    }
    next(error);
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}