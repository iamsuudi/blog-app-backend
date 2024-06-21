const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    given_name: String,
    family_name: String,
    email: String,
    github: String,
    passwordHash: String,
    picture: String,
});

userSchema.virtual('id', async function () {
    return this._id.toString();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
