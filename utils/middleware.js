const jwt = require('jsonwebtoken');
const config = require('./config');

const logger = require('./logger');

const requestLogger = (req, res, next) => {
    logger.info('method: ', req.method);
    logger.info('path: ', req.path);
    logger.info('body: ', req.body);
    logger.info('-------');
    next();
};

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

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

const tokenExtractor = (req, res, next) => {
    let token = req.get('authorization');

    if (token && token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
    } else {
        token = null;
    }
    req.token = token;
    next();
};

const userExtractor = (req, res, next) => {
    if (req.token) {
        const decodedToken = jwt.verify(req.token, config.SECRET);

        req.user = decodedToken.id.toString();
    }
    next();
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
};
