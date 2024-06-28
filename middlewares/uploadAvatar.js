const fsPromises = require('node:fs/promises');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fsPromises.mkdir(path.join(__dirname, '..', 'userAvatars'), {
            recursive: true,
        });
        cb(null, './userAvatars');
    },
    filename: async (req, file, cb) => {
        const { user } = req;

        const userId = user._id.toString();
        
        req.avatar = `${userId}${path.extname(file.originalname)}`;

        cb(null, `${userId}${path.extname(file.originalname)}`);
    },
});

// Create the multer instance
const uploadUserAvatar = multer({ storage }).single('picture');

module.exports = uploadUserAvatar;
