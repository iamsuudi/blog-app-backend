const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    givenName: String,
    familyName: String,
    email: String,
    title: String,
    github: String,
    githubId: String,
    passwordHash: String,
    picture: String,
});

/* eslint no-param-reassign: 0, no-underscore-dangle: 0 */
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
        delete returnedObject.githubId;
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
