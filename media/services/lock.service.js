import { pool } from '../../config/db.js';

export const lockFilesFn = async (password, fileId) => {
    const query = `update files set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [true, password, fileId])
    const message = `password saved`
    return message
}

export const unlockFiles = async (fileId) => {
    const query = `update files set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [false, null, fileId])
    const message = `file unlocked`
    return message
}

export const lockFolderFn = async (password, folderId) => {
    const query = `update folders set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [true, password, folderId])
    const message = 'password saved'
    return message
}

export const unlockFolderFn = async (folderId) => {
    const query = `update folders set is_locked = $1, password = $2 where id = $3`
    await pool.query(query, [false, null, folderId])
    const message = `folder unlocked`
    return message
}