import express from 'express'
import authRoutes from './auth/index.js'
import profileRoutes from './users/profile.js'
import todoRoutes from './todo/index.js'

const router = express.Router()

router.use('/', authRoutes)
router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)
router.use('/todo', todoRoutes)

router.get('/health', (req, res) => {
    res.json({
        status: 'OK', timestamp: new Date().toISOString()
    })
})

export default router