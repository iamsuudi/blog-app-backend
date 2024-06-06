const User = require('../models/user');

export const getAllUsers = async (req, res) => {
    const users = await User.find({}).populate('blogs', {
        title: 1,
        url: 1,
        likes: 1,
    });

    res.status(200).json(users);
};
