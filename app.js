const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('express-async-errors');
const middleware = require('./utils/middleware');
const config = require('./utils/config');
const logger = require('./utils/logger');
const blogController = require('./controllers/blogs');
const userController = require('./controllers/users');
const loginRouter = require('./controllers/login');

mongoose.set('strictQuery', false);

logger.info('connecting to mongodb');

mongoose.connect(config.MONGODB_URI).then(() => {
  logger.info('connected to mongodb');
}).catch(error => {
  logger.error('error connecting to mongodb: ', error.message);
});

const app = express();

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);
app.use('/api/blogs', blogController);
app.use('/api/users', userController);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


module.exports = app;
