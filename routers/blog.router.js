const express = require('express');
const blogController = require('../controllers/blogs.controller');
const uploadBlogThumbnail = require('../middlewares/uploadBlogThumbnail');

const blogRouter = express.Router();

blogRouter.get('/blogs', blogController.getAllBlogs);
blogRouter.post('/blogs', blogController.createBlog);

blogRouter.get('/blogs/:blogId', blogController.getBlog);
blogRouter.delete('/blogs/:blogId', blogController.deleteBlog);
blogRouter.put('/blogs/:blogId', blogController.updateBlog);

blogRouter.put(
    '/blogs/:blogId/thumbnail',
    uploadBlogThumbnail,
    blogController.updateThumbnail,
);

module.exports = blogRouter;
