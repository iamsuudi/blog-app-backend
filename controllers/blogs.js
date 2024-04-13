const express = require('express');
const Blog = require('../models/blog');

const blogController = express.Router();

blogController.get('/', async (req, res) => {
    const blogs = await Blog.find({});
    
    res.json(blogs);
})

blogController.post('/', async (req, res, next) => {
    const newBlog = new Blog({...req.body});

    try {
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        next(error);
    }

})

module.exports = blogController;