const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('express-async-errors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

const config = require('./utils/config');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');
const unknownEndpoint = require('./middlewares/unknownEndPoint');
const errorHandler = require('./middlewares/errorHandler');
const userRouter = require('./routers/user.router');
const blogRouter = require('./routers/blog.router');
const loginRouter = require('./routers/login.router');

mongoose.set('strictQuery', false);

logger.info('connecting to mongodb');

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to mongodb');
    })
    .catch((error) => {
        logger.error('error connecting to mongodb: ', error.message);
    });

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173', // React app's URL
        credentials: true,
    }),
);
app.use(express.static('dist'));
app.use(express.json());
app.use(
    session({
        secret: config.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60,
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
    }),
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);
require('./auth/authenticator');

app.use('/api', userRouter, blogRouter, loginRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
