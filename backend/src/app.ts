import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import leadsRoutes from './routes/leads.routes.js'
import followupsRoutes from './routes/followups.routes.js'
import bookingsRoutes from './routes/bookings.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import packagesRoutes from './routes/packages.routes.js'
import calendarRoutes from './routes/calendar.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendDistPath = path.join(__dirname, '../frontend/dist')

app.use(helmet())
app.use(express.json())
app.use(
  cors({
    origin: env.nodeEnv === 'production' ? env.frontendUrl : true,
    credentials: true
  })
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env.nodeEnv === 'development'
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/leads', leadsRoutes)
app.use('/api/followups', followupsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/packages', packagesRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/reports', reportsRoutes)

if (env.nodeEnv === 'production') {
  app.use(express.static(frontendDistPath))

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, error: 'Not found' })
    }
    return res.sendFile(path.join(frontendDistPath, 'index.html'))
  })
}

app.get('/api/health', (_req, res) => {
  return res.json({ success: true, data: { status: 'ok' } })
})

app.use(errorHandler)

export default app
