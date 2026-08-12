// FILE: server/middleware/errorHandler.js
import { logger } from '../utils/logger.js'

export function notFound(req, res, next) {
  res.status(404).json({ success: false, error: { message: 'Route not found' } })
}

export function errorHandler(err, req, res, next) {
  logger.error(err.message)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(status === 500 ? { stack: process.env.NODE_ENV === 'production' ? undefined : err.stack } : {}),
    },
  })
}
