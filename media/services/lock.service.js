const { pool, s3 } = require('../../config/db');

export const lockFilesFn = async (password, fileId) => {
    const query = `update files set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [true, password, fileId])
    return message = `password saved`
}

export const unlockFiles = async (fileId) => {
    const query = `update files set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [false, null, fileId])
    return message = `file unlocked`
}

export const lockFolderFn = async (password, folderId) => {
    const query = `update folders set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [true, password, fileId])
    return message = 'password saved'
}

export const unlockFolderFn = async (folderId) => {
    const query = `update folders set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [false, null, folderId])
    return message = `folder unlocked`
}