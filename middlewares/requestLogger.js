const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    logger.info('method: ', req.method);
    logger.info('path: ', req.path);
    logger.info('body: ', req.body);
    logger.info('-------');
    next();
};

module.exports = requestLogger;
