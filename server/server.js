import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { rateLimit } from 'express-rate-limit'
import pool from './config/db.js'

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiter for DDoS / brute-force protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 200 requests per 15 minutes
    message: { message: "Too many requests from this IP. Please try again after 15 minutes." }
})

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Apply rate limiter to /api
app.use('/api', limiter)
app.use('/api', apiRoutes)

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Something went wrong'
    })
})

// Database connectivity check and startup
async function startServer() {
    try {
        await pool.query("SELECT 1")

        console.table({
            Server: `http://localhost:${PORT}`,
            Database: "Connected!",
            Environment: process.env.NODE_ENV ?? "development"
        })

        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
                console.log(`API available at http://localhost:${PORT}/api`);
            })
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

startServer()

export default app