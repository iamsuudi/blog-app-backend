const fsPromises = require('node:fs/promises');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fsPromises.mkdir(path.join(__dirname, '..', 'blogThumbnails'), {
            recursive: true,
        });
        cb(null, './blogThumbnails');
    },
    filename: async (req, file, cb) => {
        const { blogId } = req.params;
        req.thumbnail = `${blogId}${path.extname(file.originalname)}`;
        cb(null, `${blogId}${path.extname(file.originalname)}`);
    },
});

// Create the multer instance
const uploadBlogThumbnail = multer({ storage }).single('thumbnail');

module.exports = uploadBlogThumbnail;
