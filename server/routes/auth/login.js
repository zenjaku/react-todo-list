import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body

        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
        if (rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid Credentials'
            })
        }

        const user = rows[0]
        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid Credentials'
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        )

        res.status(201).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Login failed' })
    }
})

export default router