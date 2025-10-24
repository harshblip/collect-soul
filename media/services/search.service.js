import { pool } from '../../config/db.js';

export const getSuggestionsFn = async (word, userId,) => {
    const query = `
        SELECT word_similarity(file_name, $1), file_name, file_type, file_url, is_locked, password, size, id
        FROM files
        WHERE user_id = $2
        AND (
            (length($1) < 3 AND file_name ILIKE $1 || '%')
        OR
            (length($1) >= 3 AND file_name % $1)
        )
        ORDER BY similarity(file_name, $1) DESC
        LIMIT 6;
    `
    const result = await pool.query(query, [word, userId])
    return result
}

export const getSearchResultsFn = async (word, userId) => {
    const query = `
        SELECT file_name, file_url, file_type, is_locked, password, size, id
        FROM files
        WHERE user_id = $2
        AND (
            (length($1) < 3 AND file_name ILIKE $1 || '%')
        OR
            (length($1) >= 3 AND file_name % $1)
        )
        ORDER BY similarity(file_name, $1) DESC
    `
    const result = await pool.query(query, [word, userId])
    return result
}

