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

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.use(express.json())

const port = 9000

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_CONNECTION_POOL_LIMIT
}).promise()

// HTTP GET Request
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

//  Fetch data [user_id, task, task_date, is_completed, created_at, updated_at]
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


// app.listen(port, () => {
//     console.log("listening on http://localhost:" + port);
// })

async function dbServer() {
    try {
        await db.query("SELECT 1")

        console.table({
            Server: `http://localhost:${port}`,
            Database: "Connected!",
            Environment: process.env.NODE_ENV ?? "development"
        })

        app.listen(port)
    } catch (error) {
        console.table({
            Database: "Disconnected!",
            Error: err.message
        })
        process.exit(1);
    }
}

dbServer()