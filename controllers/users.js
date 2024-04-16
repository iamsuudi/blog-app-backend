const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');

const userController = express.Router();

userController.get('/', async (req, res) => {
    const users = await User.find({}).populate('Blog', {title: 1, url: 1, likes: 1});

    res.status(200).json(users);
});

userController.post('/', async (req, res, next) => {
    const { username, name, password } = req.body;

    if (!password) res.status(400).json({ error: 'password missing' });

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
