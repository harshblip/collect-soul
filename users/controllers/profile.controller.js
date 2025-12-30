import { pool } from "../../config/db.js";
import bcrypt from 'bcrypt'
import { getUsers } from "./auth.controller.js";

export const deleteUser = async (req, res) => {
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
            return res.status(204).json({ message: "account deleted successfully" });
        } else {
            return res.status(404).json({ message: "error while deleting user record" })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const updateUser = async (req, res) => {
    const { username, email, id } = req.body;
    try {
        if (!username || !email || !id) {
            return res.status(404).json({ message: "please send all of the parameters" })
        }
        const query = `update users set username = $1, email = $2 where id = $3`;
        const check = await pool.query(query, [username, email, id]);
        console.log("check", check);
        if (check.rowCount === 1) {
            return res.status(200).json({ message: "account successfully updated" })
        } else {
            return res.status(404).json({ message: "no such account found" })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.name })
    }
}

export const updatePassword = async (req, res) => {
    const { email, password } = req.body
    console.log(email)
    try {
        if (!email || !password) {
            return res.status(404).json({ message: 'email or password are absent' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `update users set password = $1 where email = $2`
        const check = await pool.query(query, [hashedPassword, email])

        console.log("check new password", check.rowCount)
        if (check.rowCount === 1) {
            return res.status(200).json({ message: "password successfully updated" })
        } else {
            return res.status(404).json({ message: "no such account found" })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.name })
    }
}

export const createUsers = async (req, res) => {
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

        const query = `insert into users (username, email, password) values ($1, $2, $3)`;

        const result = await pool.query(query, [username, email, hashedPassword]);
        console.log(result);
        return res.status(201).json({ message: "user signed up successfully", result: result.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}