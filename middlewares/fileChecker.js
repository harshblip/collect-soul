const multer = require('multer');

const validMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',

    // Videos
    'video/mp4',
    'video/avi',
    'video/mkv',
    'video/webm',

    // PDFs
    'application/pdf',

    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/flac',
    'audio/ogg'
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const mimetype = file.mimetype;
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype.startsWith('video/');
    const isPDF = mimetype === 'application/pdf';
    const isAudio = mimetype.startsWith('audio/');

    console.log(file);

    if (!validMimeTypes.includes(mimetype)) {
        return cb(new Error('Invalid file type. Only images, videos, PDFs, and audio files are allowed!'), false);
    }

    if (isImage && file.size > 7 * 1024 * 1024) {
        return cb(new Error("Images larger than 7MB are not allowed bhai!"), false);
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
        return cb(new Error("Videos larger than 50MB are not allowed bhai!"), false);
    }

    if (isPDF && file.size > 20 * 1024 * 1024) {
        return cb(new Error("PDFs larger than 20MB are not allowed bhai!"), false);
    }

    if (isAudio && file.size > 15 * 1024 * 1024) {
        return cb(new Error("Audio files larger than 15MB are not allowed bhai!"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Global upper bound, individual filters above still apply
    }
});

module.exports = upload;
