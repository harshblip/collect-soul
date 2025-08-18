
export function isValidFileSize(size, maxMB) {
    return size <= maxMB * 1024 * 1024;
}

export function removeFileExtension(filename) {
    if (typeof filename !== 'string') return '';

    const lastDot = filename.lastIndexOf('.');

    if (lastDot === -1) return filename;

    return filename.slice(0, lastDot);
}
