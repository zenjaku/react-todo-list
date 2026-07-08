import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'
import dotenv from 'dotenv'
import { authenticateJsonToken } from '../../middleware/auth.js'

dotenv.config()

const router = express.Router()

// Fetch user profile
router.get('/', authenticateJsonToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);
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
router.patch('/', authenticateJsonToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, currentPassword, newPassword } = req.body;

        const [userRows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = userRows[0];

        if (username || email) {
            const [existing] = await pool.query(
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
        await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Profile update failed" });
    }
})

export default router