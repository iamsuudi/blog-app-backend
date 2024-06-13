const express = require('express');
const blogController = require('../controllers/blogs.controller');

const blogRouter = express.Router();

blogRouter.get('/blogs', blogController.getAllBlogs);
blogRouter.post('/blogs', blogController.createBlog);
blogRouter.get('/blogs/:blogId', blogController.getBlog);
blogRouter.delete('/blogs/:blogId', blogController.deleteBlog);
blogRouter.put('/blogs/:blogId', blogController.updateBlog);

module.exports = blogRouter;
