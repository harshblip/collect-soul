const { pool } = require("../../config/db")

// let path = []

const findFolder = async (folderId, path = []) => {
    if (!folderId) {
        return
    }

    const getFolderName = `select file_name, parent_id from folders where id = $1`
    const result = await pool.query(getFolderName, [folderId])
    // console.log(path)

    const folderName = result.rows[0].file_name
    const parent_id = result.rows[0].parent_id

    path.push(folderName)
    await findFolder(parent_id, path)

}

module.exports = { findFolder }