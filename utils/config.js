require('dotenv').config();

const { PORT, SALT_ROUNDS, SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } =
    process.env;

const MONGODB_URI =
    process.env.NODE_ENV !== 'production'
        ? process.env.LOCAL_MONGODB_URI
        : process.env.MONGODB_URI;

module.exports = {
    MONGODB_URI,
    PORT,
    SALT_ROUNDS,
    SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
};
