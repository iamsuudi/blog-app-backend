const express = require('express');
const userController = require('../controllers/users.controller');
const uploadUserAvatar = require('../middlewares/uploadAvatar');

const userRouter = express.Router();

userRouter.get('/users', userController.getAllUsers);
userRouter.get('/users/:userId', userController.getUser);

userRouter.get('/users/me', userController.getMe);
userRouter.put('/users/me', userController.updateMe);
userRouter.put(
    '/users/me/avatar',
    uploadUserAvatar,
    userController.updateAvatar,
);
userRouter.delete('/users/delete', userController.deleteMe);

module.exports = userRouter;
