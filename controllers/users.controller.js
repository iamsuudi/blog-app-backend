const User = require('../models/user');

const getAllUsers = async (req, res) => {
    const users = await User.find({});

    return res.status(200).json(users);
};

const getMe = async (req, res) => {
    const { user } = req;

    return res.status(200).json(user);
};

const updateMe = async (req, res) => {
    const { user } = req;
    const update = req.body;
    const updatedUser = await User.findByIdAndUpdate(user._id, update);

    return res.status(202).json(updatedUser);
};

const deleteMe = async (req, res) => {
    const { user } = req;
    const update = req.body;
    await User.findByIdAndDelete(user._id, update);

    return res.status(204).json({ message: 'Deleted' });
};

const getUser = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    return res.status(204).json(user);
};

module.exports = {
    getAllUsers,
    getMe,
    updateMe,
    deleteMe,
    getUser,
};
