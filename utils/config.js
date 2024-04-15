require('dotenv').config();

const { PORT, saltRounds, SECRET } = process.env;

const MONGODB_URI = process.env.NODE_ENV !== 'production' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;

module.exports = {
    MONGODB_URI,
    PORT,
    saltRounds,
    SECRET
};
