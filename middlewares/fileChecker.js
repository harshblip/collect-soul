import multer from 'multer';

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

    if (!validMimeTypes.includes(mimetype)) {
        return cb(new Error('Invalid file type. Only images, videos, PDFs, and audio files are allowed!'), false);
    }

    // multer hasn't fully processed the file to validate based on the file size

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // Global upper bound, individual filters above still apply
    }
});
