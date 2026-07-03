// Old Common Js
// const express = require('express')
// const mysql = require('mysql2')
// const cors = require('cors')
// const path = require('path')

import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import path from 'path'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import { fileURLToPath } from 'url'
import { authenticateJsonToken } from './middleware/auth.js'
import { rateLimit } from 'express-rate-limit'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Dynamic CORS configuration (Vite local dev server port fallback)
app.use(cors({
    origin: process.env.CLIENT_URL
}))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// Rate limiter for DDoS / brute-force protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 200 requests per 15 minutes
    message: { message: "Too many requests from this IP. Please try again after 15 minutes." }
})
app.use('/api/', limiter)

const port = 1000

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_CONNECTION_POOL_LIMIT
}).promise()

// HTTP Requests - API's

// Login Request
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body

        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username])
        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const user = rows[0]

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
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
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" })
    }
})

// Register Request
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body
        const [checkExistingUsers] = await db.query("SELECT id FROM users WHERE username = ? OR email = ?", [username, email])

        if (checkExistingUsers.length > 0) {
            return res.status(409).json({
                message: "Username or Email Address already exists"
            })
        }

        const errors = [];

        if (password.length < 8)
            errors.push("Password must be at least 8 characters.");

        if (!/[A-Z]/.test(password))
            errors.push("Password must contain an uppercase letter.");

        if (!/[a-z]/.test(password))
            errors.push("Password must contain a lowercase letter.");

        if (!/\d/.test(password))
            errors.push("Password must contain a number.");

        if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password))
            errors.push("Password must contain a special character.");

        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hashedPassword])

        res.status(201).json({
            message: "Registration successful",
            userId: result.insertId
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" })
    }
})

// Fetch user profile
app.get('/api/profile', authenticateJsonToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
})

// Update user profile
app.patch('/api/profile', authenticateJsonToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, currentPassword, newPassword } = req.body;

        const [userRows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = userRows[0];

        if (username || email) {
            const [existing] = await db.query(
                "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?",
                [username || "", email || "", userId]
            );
            if (existing.length > 0) {
                return res.status(409).json({ message: "Username or Email already exists" });
            }
        }

        const updates = [];
        const values = [];

        if (username) {
            updates.push("username = ?");
            values.push(username);
        }
        if (email) {
            updates.push("email = ?");
            values.push(email);
        }
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to change password" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }

            const errors = [];
            if (newPassword.length < 8)
                errors.push("Password must be at least 8 characters.");
            if (!/[A-Z]/.test(newPassword))
                errors.push("Password must contain an uppercase letter.");
            if (!/[a-z]/.test(newPassword))
                errors.push("Password must contain a lowercase letter.");
            if (!/\d/.test(newPassword))
                errors.push("Password must contain a number.");
            if (!/[!@#$%^&*(),.?\":{}|<>_\\-]/.test(newPassword))
                errors.push("Password must contain a special character.");

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.push("password_hash = ?");
            values.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No updates provided" });
        }

        values.push(userId);
        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Profile update failed" });
    }
})

//  Fetch data list [user_id, task, task_date, is_completed, created_at, updated_at]
app.get('/api/todo', authenticateJsonToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC", [userId])

        res.json(rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch data from todos table" })
    }
})

// view specific data
app.get('/api/todo/:id', authenticateJsonToken, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id;

        const [result] = await db.query("SELECT id, title, task, task_date, is_completed, created_at, updated_at FROM todos WHERE id =? AND user_id = ?", [id, userId])

        if (result.length === 0) {
            return res.status(400).json({
                message: "No record found"
            })
        }

        return res.status(200).json({
            message: "Record found",
            todo: result[0]
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch data from todos table" })
    }
})

// Create new data
app.post('/api/todo/create', authenticateJsonToken, async (req, res) => {
    try {
        const { title, task, task_date, is_completed } = req.body

        const userId = req.user.id;

        const [result] = await db.query("INSERT INTO todos (title, task, task_date, is_completed, user_id) VALUES (?, ?, ?, ?, ?)", [title, task, task_date, is_completed, userId])

        res.status(201).json({
            message: "Todo saved successful",
            todoId: result.insertId
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save todos" })

    }
})

// update data
app.patch('/api/todo/update/:id', authenticateJsonToken, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const updates = []
        const values = []
        const allowedKeys = ['title', 'task', 'task_date', 'is_completed']

        for (const [key, value] of Object.entries(req.body)) {
            if (allowedKeys.includes(key)) {
                updates.push(`${key} = ?`)
                values.push(value)
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No record found."
            })
        }

        values.push(id, userId)

        const [result] = await db.query(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, values)

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No records found"
            })
        }

        res.status(201).json({
            message: "Todo updated successful",
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update todo: ", id })
    }
})


// delete data
app.delete('/api/todo/delete/:id', authenticateJsonToken, async (req, res) => {
    const { id } = req.params

    try {
        const userId = req.user.id

        const [result] = await db.query(`DELETE FROM todos WHERE id = ? AND user_id = ?`, [id, userId])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No records found"
            })
        }

        res.status(201).json({
            message: "Todo deleted successful",
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update todo: ", id })
    }
})



// console logs
async function dbServer() {
    try {
        await db.query("SELECT 1")

        console.table({
            Server: `http://localhost:${port}`,
            Database: "Connected!",
            Environment: process.env.NODE_ENV ?? "development"
        })

        if (!process.env.VERCEL) {
            app.listen(port)
        }
    } catch (error) {
        console.table({
            Database: "Disconnected!",
            Error: error.message
        })
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
}

dbServer()

export default app