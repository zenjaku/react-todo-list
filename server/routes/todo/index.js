import express from 'express'
import pool from '../../config/db.js'
import { authenticateJsonToken } from '../../middleware/auth.js'

const router = express.Router()

// Protect all todo endpoints
router.use(authenticateJsonToken)

// GET /api/todo - Fetch data list
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC", [userId])
        res.json(rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch data from todos table" })
    }
})

// GET /api/todo/:id - View specific data
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id;

        const [result] = await pool.query(
            "SELECT id, title, task, task_date, is_completed, created_at FROM todos WHERE id = ? AND user_id = ?",
            [id, userId]
        )

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

// POST /api/todo/create - Create new data
router.post('/create', async (req, res) => {
    try {
        const { title, task, task_date, is_completed } = req.body
        const userId = req.user.id;

        const [result] = await pool.query(
            "INSERT INTO todos (title, task, task_date, is_completed, user_id) VALUES (?, ?, ?, ?, ?)",
            [title, task, task_date, is_completed, userId]
        )

        res.status(201).json({
            message: "Todo saved successful",
            todoId: result.insertId
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save todos" })
    }
})

// PATCH /api/todo/update/:id - Update data
router.patch('/update/:id', async (req, res) => {
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

        const [result] = await pool.query(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, values)

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
        res.status(500).json({ error: "Failed to update todo: " + id })
    }
})

// DELETE /api/todo/delete/:id - Delete data
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params
    try {
        const userId = req.user.id
        const [result] = await pool.query(`DELETE FROM todos WHERE id = ? AND user_id = ?`, [id, userId])

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
        res.status(500).json({ error: "Failed to delete todo: " + id })
    }
})

export default router
