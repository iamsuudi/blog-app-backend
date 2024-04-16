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

    if (!req.user || req.user !== userId) {
        return res.status(401).json({ error: 'token invalid' });
    }

    const user = await User.findById(req.user);

    if (!likes) likes = 0;

    const newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: req.user,
    });

    const savedBlog = await newBlog.save();

    if (savedBlog) {
        await User.findByIdAndUpdate(req.user, {
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

    if (!blog) next();

    const userId = blog.user.toString();

    if (!req.user || req.user !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }

    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (deleted) res.status(204).json(deleted);

    next();
});

/* eslint consistent-return: 0 */
blogController.put('/:id', async (req, res, next) => {
    const blogExist = await Blog.findById(req.params.id);

    if (!blogExist) next();

    const blog = { ...req.body };

    const userId = blogExist.user.toString();

    if (!req.user || req.user !== userId) {
        // console.log('decoded id: ', typeof decodedToken.id, decodedToken.id);
        // console.log('user id: ', typeof userId, userId);
        return res.status(401).json({ error: 'token invalid' });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
        new: true,
        runValidators: true,
    });

    if (updatedBlog) return res.json(updatedBlog.toJSON());

    next();
});

module.exports = blogController;
