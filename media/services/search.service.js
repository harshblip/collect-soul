const { pool } = require('../../config/db');

export const getSuggestionsFn = async (word, userId, type, starred, locked, date) => {
    const query = `
        SELECT file_name, file_url, is_locked, password, size, id
        FROM files
        WHERE user_id = $2
        AND (
            (length($1) < 3 AND file_name ILIKE $1 || '%')
        OR
            (length($1) >= 3 AND file_name % $1)
        )
        AND ($3::file_type IS NULL OR file_type = $3::file_type)
        AND ($4::boolean IS NULL OR starred = $4::boolean)
        AND ($5::boolean IS NULL OR is_locked = $5::boolean)
        AND ($6::timestamp without time zone IS NULL OR created_at = $6::timestamp without time zone)
        ORDER BY similarity(file_name, $1) DESC
        LIMIT 6;
    `
    const result = await pool.query(query, [word, userId, type, starred, locked, date])
    return result
}

export const getSearchResultsFn = async (word, userId, type, starred, locked, date) => {
    const query = `
        SELECT file_name, file_url, is_locked, password, size, id
        FROM files
        WHERE user_id = $2
        AND (
            (length($1) < 3 AND file_name ILIKE $1 || '%')
        OR
            (length($1) >= 3 AND file_name % $1)
        )
        AND ($3::file_type IS NULL OR file_type = $3::file_type)
        AND ($4::boolean IS NULL OR starred = $4::boolean)
        AND ($5::boolean IS NULL OR is_locked = $5::boolean)
        AND ($6::timestamp without time zone IS NULL OR created_at = $6::timestamp without time zone)
        ORDER BY similarity(file_name, $1) DESC
    `
    const result = await pool.query(query, [word, userId, type, starred, locked, date])
    return result
}

