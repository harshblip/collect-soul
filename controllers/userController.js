const pool = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const getUsers = async (email) => {
    try {
        const query = `select * from users where email = $1`;
        const result = await pool.query(query, [email]);
        const ans = result.rows[0];
        console.log("getUsers", ans);
        return ans;
    } catch (err) {
        console.error(err);
    }
}

const createUsers = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "some of the fields are missing" })
        }

        const checkUser = await getUsers(email);
        if (checkUser) {
            return res.status(409).json({ message: "an account already exists. try signing in" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `insert into users (username, email, password_hash) values ($1, $2, $3)`;

        const result = await pool.query(query, [username, email, hashedPassword]);
        console.log(result);
        res.status(201).json({ message: "user signed up successfully", result: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "internal server error" })
    }
}

const loginUser = async (req, res) => {
    const { id, email, password } = req.query;
    const ans = await getUsers(email);
    console.log("ans", ans);
    try {
        if (ans) {
            const passwordCheck = await bcrypt.compare(password, ans.password_hash);
            const payload = {
                email: email,
                id: id
            }
            if (passwordCheck) {
                const access_token = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: '2m' })
                const refresh_token = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '1d' });
                
                res.cookie('refreshToken', refresh_token, {
                    httpOnly: true,
                    // secure: true,    
                    sameSite: 'Strict'
                })

                res.status(200).json({ message: "user logged in successfully", access_token })
            } else {
                res.status(404).json({ message: "password does not match" })
            }
        } else {
            res.status(404).json({ message: "no such account found. try signing up" })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message })
    }
}

const logoutUser = async (req, res) => {
    try {
        //  secure: true // write this fro when hosting the backend
        res.clearCookie("refreshToken", { httpOnly: true, sameSite: 'Strict' })
        res.status(200).json({ message: "logout successful" })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message })
    }
}

const deleteUser = async (req, res) => {
    const { id, email } = req.query;
    try {
        if (!id) {
            return res.status(404).json({ message: "id is required to delete an account" })
        }
        const query = `delete from users where user_id = $1`;
        pool.query(query, [id]);
        const checkDelete = await getUsers(email);
        console.log(checkDelete)
        if (checkDelete) {
            res.status(204).json({ message: "account deleted successfully" });
        } else {
            res.status(404).json({ message: "error while deleting user record" })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message })
    }
}

const updateUser = async (req, res) => {
    const { username, email, password, id } = req.body;
    try {
        if (!username || !email || !password || !id) {
            return res.status(404).json({ message: "please send all of the parameters" })
        }
        const query = `update users set username = $1, email = $2, password_hash = $3 where id = $4`;
        const check = await pool.query(query, [username, email, password, id]);
        console.log("check", check);
        if (check.rowCount === 1) {
            res.status(200).json({ message: "account successfully updated" })
        } else {
            res.status(404).json({ message: "no such account found" })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.name })
    }
}

module.exports = { getUsers, createUsers, loginUser, deleteUser, updateUser, logoutUser }