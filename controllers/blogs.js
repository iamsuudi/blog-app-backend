const express = require('express');
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const config = require('../utils/config');

const blogController = express.Router();

blogController.get('/', async (req, res) => {
    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
    });

    res.status(200).json(blogs);
});

blogController.post('/', async (req, res, next) => {
    const { title, author, url, userId } = req.body;
    let { likes } = req.body;

    const decodedToken = jwt.verify(req.token, config.SECRET);

    if (!decodedToken || decodedToken.id !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }

    const user = await User.findById(decodedToken.id);

    if (!likes) likes = '0';

    const newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: decodedToken.id,
    });

    const savedBlog = await newBlog.save();

    if (savedBlog) {
        await User.findByIdAndUpdate(decodedToken.id, {
            username: user.username,
            name: user.name,
            passwordHash: user.passwordHash,
            blogs: user.blogs.concat(savedBlog._id),
        });

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
    const blog = await Blog.findById(req.params.id);

    const userId = blog.user.toString();

    const decodedToken = jwt.verify(req.token, config.SECRET);

    if (!decodedToken || decodedToken.id !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }

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
