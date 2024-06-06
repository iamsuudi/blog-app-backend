const jwt = require('jsonwebtoken');
const config = require('../utils/config');

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
    tokenExtractor,
    userExtractor,
};
