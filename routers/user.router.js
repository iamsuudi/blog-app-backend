const express = require('express');
const userController = require('../controllers/users.controller');

const userRouter = express.Router();

userRouter.get('/', userController.getAllUsers);

module.exports = userRouter;
