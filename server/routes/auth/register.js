import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body
        const [checkExistingUsers] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])

        if (checkExistingUsers.length > 0) {
            return res.status(409).json({
                message: 'Username or Email Address already exists'
            })
        }

        const errors = []

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters.')
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain an uppercase letter.')
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain a lowercase letter.')
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain a number.')
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
            errors.push('Password must contain a special character.')
        }

        if (errors.length > 0) {
            return res.status(400).json({
                errors
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword])

        res.status(201).json({
            message: 'Registration successful',
            userId: result.insertId
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Registration failed' })
    }
})

export default router