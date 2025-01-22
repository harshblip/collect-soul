const multer = require('multer')

const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/mkv',
    'video/webm'
]

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    console.log(file)
    if (!validMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only images and videos are allowed bhsdk!'), false);
    }

    if (isImage && file.size > 7 * 1024 * 1024) {
        return cb(new Error("Images larger than 7MB are not allowed bhai!"), false);
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
        return cb(new Error("Videos larger than 50MB are not allowed bhai!"), false);
    }

    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

module.exports = upload;