const pool = require('../config/db')
const bcrypt = require('bcrypt')

const getUsers = (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}

const createUsers = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if(!username || !email || !password){
            return res.status(400).json({message: "some of the fields are missing"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `insert into users (username, email, password_hash) values ($1, $2, $3)`;

        const result = await pool.query(query, [username, email, hashedPassword]);

        res.status(201).json({message: "user signed up successfully", aef: result.rows[0]});
    } catch(err){
        console.error(err);
        res.status(500).json({message: "internal server error"})
    }
}

module.exports = { getUsers, createUsers }