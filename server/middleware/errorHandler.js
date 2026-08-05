// FILE: server/middleware/errorHandler.js
import { logger } from '../utils/logger.js'

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.status = 404
  next(error)
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const status = error.status || 500

  if (status >= 500) {
    logger.error(error.message, error.stack)
  }

  const payload = {
    success: false,
    error: {
      message: error.expose || status < 500 ? error.message : 'Internal server error',
    },
  }

  return res.status(status).json(payload)
}
