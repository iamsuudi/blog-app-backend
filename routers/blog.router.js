const express = require('express');
const blogController = require('../controllers/blogs.controller');

const blogRouter = express.Router();

blogRouter.get('/', blogController.getAllBlogs);
blogRouter.post('/', blogController.createBlog);
blogRouter.get('/:blogId', blogController.getBlog);
blogRouter.delete('/:blogId', blogController.deleteBlog);
blogRouter.put('/:blogId', blogController.updateBlog);

module.exports = blogRouter;
