const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');
const logger = require('../utils/logger');

const loginRouter = express.Router();

loginRouter.post('/', async (req, res, next) => {

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    
    const passwordCorrect =
        user === null
            ? false
            : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return res.status(401).json({ error: 'invalid username or password' });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET);

    res.status(200).send({
        token,
        username: user.username,
        name: user.name,
    });
});

module.exports = loginRouter;
