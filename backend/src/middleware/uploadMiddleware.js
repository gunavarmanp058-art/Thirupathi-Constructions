const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + originalName);
    }
});

const fileFilter = (req, file, cb) => {
    // Basic category check
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    // Extension check for extra safety (optional but good for specific allowed list)
    const allowedExts = /jpeg|jpg|png|webp|gif|mp4|mov|webm|avi|mkv/;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());

    if (isImage || isVideo || extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter
});

module.exports = upload;
