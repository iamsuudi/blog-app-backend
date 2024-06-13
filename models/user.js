const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
});

userSchema.virtual('id', async function () {
    return this._id.toString();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
