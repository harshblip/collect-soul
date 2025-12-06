import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";
import bcrypt from 'bcrypt'

let message = ''

export const getUsers = async (email) => {
    try {
        const query = `select * from users where email = $1`;
        const result = await pool.query(query, [email]);
        const ans = result.rows[0];
        console.log("getUsers", ans);
        return ans
    } catch (err) {
        console.log("errrr-> ", err)
    }
}

export const getUserData = async (req, res) => {
    const { id } = req.query
    try {
        const query = `select * from users where id = $1`
        const result = await pool.query(query, [id])
        res.status(200).json({ message: result.rows[0] })
    } catch (err) {
        console.log(err)
    }
}

export const loginUser = async (req, res) => {
    const { email, password, checked } = req.query;
    const ans = await getUsers(email);
    console.log("ans", ans, checked);
    try {
        if (ans) {
            const passwordCheck = true;

            const now = new Date();
            if (ans.locked_until && now < ans.locked_until) {
                const remaining = Math.ceil((ans.locked_until - now) / 1000);
                message = `Account locked. Try again in ${remaining}s`
                return res.status(403).json({ message })
            }

            const payload = {
                id: ans.id,
                email: ans.email,  
                username: ans.username,
            }

            // console.log(payload)
            if (passwordCheck) {
                const access_token = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: '7d' })
                const refresh_token = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: checked === true ? '7d' : '1d' });

                res.cookie('refreshToken', refresh_token, {
                    httpOnly: true,
                    // secure: true,    
                    sameSite: 'Strict',
                    maxAge: checked === true ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
                })
                return res.status(200).json({ message: access_token })
            } else {
                let failedAttempts = ans.failed_attempts + 1;
                let lockoutLevel = ans.lockout_level;
                let lockedUntil = null;

                if ((lockoutLevel === 0 && failedAttempts >= 5) || (lockoutLevel > 0 && failedAttempts >= 2)) {
                    lockoutLevel += 1;
                    const lockMinutes = lockoutLevel === 1 ? 1 : lockoutLevel * 2;
                    lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
                    failedAttempts = 0;
                }

                await pool.query(`update users set failed_attempts = $1, lockout_level = $2, locked_until = $3 where email = $4`, [failedAttempts, lockoutLevel, lockedUntil, email]);
                message = "password does not match"
                return res.status(400).json({ message })
            }
        } else {
            message = "no such account found. try signing up"
            return res.status(404).json({ message })
        }
    } catch (err) {
        console.error("erroor -> ", err);
        message = err.message
        return res.status(500).json({ message })
    }
}

export const logoutUser = async (req, res) => {
    try {
        //  secure: true // write this fro when hosting the backend
        res.clearCookie("refreshToken", { httpOnly: true, sameSite: 'Strict' })
        return res.status(200).json({ message: "logout successful" })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}