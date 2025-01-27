const pool = require('../config/db')
const bcrypt = require('bcrypt')

const getUsers = async (email) => {
    try {
        if (!email) {
            return res.status(400).json({ message: "email is needed" })
        }
        const query = `select * from users where email = $1`;
        const result = await pool.query(query, [email]);
        const ans = result.rows[0];

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
    const { email, password } = req.query;
    const ans = await getUsers(email);
    console.log("ans", ans);
    try {
        if (ans) {
            const passwordCheck = await bcrypt.compare(password, ans.password_hash);
            if (passwordCheck) {
                res.status(200).json({ message: "user logged in successfully" })
            } else[
                res.status(404).json({ message: "password does not match" })
            ]
        } else {
            res.status(404).json({ message: "no such account found. try signing up" })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" })
    }
}

const deleteUser = async (req, res) => {
    const { email } = req.query;
    try {
        if (!email) {
            return res.status(404).json({ message: "email is required to delete an account" })
        }
        const query = `delete from users where email = $1`;
        pool.query(query, [email]);
        const checkDelete = await getUsers(email);

        if(checkDelete.rowCount === 0){
            res.status(200).json({message: "account deleted successfully"});
        }else {
            res.status(404).json({message: "error while deleting user record"})
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" })
    }
}

const updateUser = async(req, res) => {
    // const 
}

module.exports = { getUsers, createUsers, loginUser, deleteUser }