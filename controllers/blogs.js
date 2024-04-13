const express = require('express');
const Blog = require('../models/blog');

const blogController = express.Router();

blogController.get('/', async (req, res) => {
    const blogs = await Blog.find({});

    res.json(blogs);
});

blogController.post('/', async (req, res, next) => {
    const newBlog = new Blog({ ...req.body });

    try {
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        next(error);
    }
});

blogController.get('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            res.json(blog);
        } else {
            res.status(400).end();
        }
    } catch (error) {
        next(error);
    }
});

module.exports = blogController;
