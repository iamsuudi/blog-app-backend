const express = require('express');
const userController = require('../controllers/users.controller');

const userRouter = express.Router();

userRouter.get('/users', userController.getAllUsers);
userRouter.get('/users/me', userController.getMe);
userRouter.get('/users/:userId', userController.getUser);
userRouter.put('/users/update', userController.updateMe);
userRouter.delete('/users/delete', userController.deleteMe);

module.exports = userRouter;
