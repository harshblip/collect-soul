import { pool } from "../../config/db.js"

export const addFilestoFolderFn = async (files, folderId) => {
    for (const file of files) {
        const query = `update files set folder_id = $1 where id = $2`
        await pool.query(query, [folderId, file.id])
    }
    const message = `${files.size} files added to folder`
    return message 
}