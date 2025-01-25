const pool = require('../config/db')

const getUsers = (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if(error){
            throw error
        }
        res.status(200).json(results.rows)
    })
}

const postUsers = (req, res) => {
    pool.query('')
}