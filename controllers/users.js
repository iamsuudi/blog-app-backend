const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');

const userController = express.Router();

userController.get('/', async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json(users);
});

userController.post('/', async (req, res, next) => {
    const { username, name, password } = req.body;

    const passwordHash = await bcrypt.hash(password, Number(config.saltRounds));

    const user = new User({
        username,
        name,
        passwordHash,
    });

    const savedUser = await user.save();

    if (savedUser) res.status(201).json(savedUser);

    next();
});

module.exports = userController;
