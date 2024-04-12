const express = require('express');
const Blog = require('../models/blog');

const blogController = express.Router();

blogController.get('/', (req, res) => {
    Blog.find({}).then(result => {
        res.json(result);
    })
})

blogController.post('/', (req, res) => {
    const newBlog = new Blog({...req.body});

    newBlog.save().then(result=> {
        res.status(201).json(result);
    })
})

module.exports = blogController;