// FILE: server/app.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { UPLOADS_DIR, DATA_DIR } from './helpers/paths.js'
import { logger } from './utils/logger.js'
import { initCloudinary } from './utils/cloudinary.js'
import { gitPull } from './services/gitPersistence.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

if (process.env.GIT_PERSISTENCE === 'true') {
  gitPull()
}

if (process.env.CLOUDINARY_CLOUD_NAME) {
  initCloudinary()
  logger.ok('Cloudinary initialized')
} else {
  logger.warn('Cloudinary not configured - falling back to local filesystem uploads')
}

app.set('trust proxy', 1)

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

app.use('/api', routes)

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '../client/dist')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next()
      }
      res.sendFile(path.join(distDir, 'index.html'))
    })
    logger.ok('Serving client build from client/dist')
  }
}

app.use(notFound)
app.use(errorHandler)

export default app
