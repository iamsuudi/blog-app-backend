const express = require('express');
const Blog = require('../models/blog');

const blogController = express.Router();

blogController.get('/', async (req, res) => {
    const blogs = await Blog.find({});

    res.json(blogs);
});

blogController.post('/', async (req, res, next) => {
    const formatted = { ...req.body };

    if (!formatted.likes) formatted.likes = '0';

    const newBlog = new Blog({ ...formatted });

    const savedBlog = await newBlog.save();
    if (savedBlog) res.status(201).json(savedBlog);
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
