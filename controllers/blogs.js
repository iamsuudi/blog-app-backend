const express = require('express');
const Blog = require('../models/blog');
const User = require('../models/user');

const blogController = express.Router();

blogController.get('/', async (req, res) => {
    const blogs = await Blog.find({});

    res.status(200).json(blogs);
});

blogController.post('/', async (req, res, next) => {
    let { title, author, url, likes, userId } = req.body;

    const user = await User.findById(userId);
    const { username, name, passwordHash, blogs } = user;

    if (!likes) likes = '0';

    const newBlog = new Blog({ title, author, url, likes, user: userId });

    const savedBlog = await newBlog.save();

    if (savedBlog) {
        await User.findByIdAndUpdate(userId, {
            username,
            name,
            passwordHash,
            blogs: blogs.concat(savedBlog._id),
        });

        const allblogs = await Blog.find({});

        res.status(201).json(savedBlog);
    }
    next();
});

blogController.get('/:id', async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
        res.json(blog);
    } else {
        // res.status(400).end();
        next();
    }
});

blogController.delete('/:id', async (req, res, next) => {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (deleted) res.status(204).json(deleted);
    else next();
});

/* eslint consistent-return: 0 */
blogController.put('/:id', async (req, res, next) => {
    const blog = { ...req.body };

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
        new: true,
        runValidators: true,
    });

    if (updatedBlog) return res.json(updatedBlog.toJSON());

    next();
});

module.exports = blogController;
