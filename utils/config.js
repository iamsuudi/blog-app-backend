require('dotenv').config();

const variables = { ...process.env };

variables.MONGODB_URI =
    process.env.NODE_ENV !== 'production'
        ? process.env.LOCAL_MONGODB_URI
        : process.env.MONGODB_URI;
delete variables.LOCAL_MONGODB_URI;

module.exports = {
    ...variables,
};
