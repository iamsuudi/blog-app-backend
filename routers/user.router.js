const express = require('express');
const userController = require('../controllers/users.controller');

const userRouter = express.Router();

userRouter.get('/users', userController.getAllUsers);

module.exports = userRouter;
