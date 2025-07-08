const pool = require('../config/db');

const getFileInfo = async (user_id, id) => {
    if (!id) {
        message = "query is empty"
        return message;
    }
    const query = `select * from files where user_id = $1 and id = $2`;
    const result = await pool.query(query, [user_id, id]);
    // console.log(result.rows)
    const images = result.rows
    return images
}

// export const getMyInfo = async (req, res) => {

// }

module.exports = { getFileInfo }