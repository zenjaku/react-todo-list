import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const caCertPath = path.join(__dirname, 'isrgrootx1.pem')
let sslConfig = undefined

if (fs.existsSync(caCertPath)) {
    sslConfig = { ca: fs.readFileSync(caCertPath) }
} else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    sslConfig = { rejectUnauthorized: true }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_CONNECTION_POOL_LIMIT,
    ssl: sslConfig,
    queueLimit: 0
})

export default pool