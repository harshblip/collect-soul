
function isValidFileSize(size, maxMB) {
    return size <= maxMB * 1024 * 1024;
}

module.exports = { isValidFileSize };
