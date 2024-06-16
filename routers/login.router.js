const express = require('express');
const passport = require('passport');
const loginController = require('../controllers/login.controller');

const loginRouter = express.Router();

// loginRouter.post('/signin', loginController.signin);
// loginRouter.post('/signup', loginController.signup);
loginRouter.post('/auth/signin', passport.authenticate('local'), (req, res) => {
    console.log({ user: req.user });
    return res.status(200).send('User is authenticated');
});
loginRouter.post(
    '/auth/signup',
    loginController.signup,
    passport.authenticate('local'),
    (req, res) => {
        console.log({ user: req.user });
        return res.status(200).send('User is authenticated');
    },
);
loginRouter.get('/auth/status', (req, res) => {
    console.log('Inside suth status end point');
    console.log(req.user);
    console.log(req.session);
    return req.user
        ? res.status(200).json(req.user)
        : res.status(401).send('Unauthorized');
});
loginRouter.post('/auth/logout', (req, res) => {
    if (!req.user) return res.sendStatus(401);
    req.logout((error) => {
        if (error) return res.sendStatus(400);
        res.sendStatus(200);
    });
});

module.exports = loginRouter;
