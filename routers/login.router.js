const express = require('express');
const loginController = require('../controllers/login.controller');

const loginRouter = express.Router();

loginRouter.post('/signin', loginController.signin);
loginRouter.post('/signup', loginController.signup);

module.exports = loginRouter;
