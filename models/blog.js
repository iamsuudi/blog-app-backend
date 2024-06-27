const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    url: String,
    date: Date,
    thumbnail: String,
    tags: [{ content: String }],
    likes: { type: Number, default: 0 },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

/* eslint no-param-reassign: 0, no-underscore-dangle: 0 */
blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
