const express = require('express');
const passport = require('passport');
const loginController = require('../controllers/login.controller');

const loginRouter = express.Router();

loginRouter.post(
    '/auth/signin',
    passport.authenticate('local'),
    loginController.authResponse,
);

loginRouter.get(
    '/auth/signin/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
);

loginRouter.get(
    '/auth/google/redirect',
    passport.authenticate('google', {
        successRedirect: 'http://localhost:5173/auth/signin',
        failureRedirect: 'http://localhost:5173/auth/signin',
    }),
    loginController.authResponse,
);

loginRouter.get(
    '/auth/signin/github',
    passport.authenticate('github', { scope: ['profile', 'email'] }),
);

loginRouter.get(
    '/auth/github/redirect',
    passport.authenticate('github', {
        successRedirect: 'http://localhost:5173/auth/signin',
        failureRedirect: 'http://localhost:5173/auth/signin',
    }),
    loginController.authResponse,
);

loginRouter.post(
    '/auth/signup',
    loginController.signup,
    passport.authenticate('local'),
    loginController.authResponse,
);

loginRouter.post('/auth/logout', loginController.logout);

module.exports = loginRouter;
