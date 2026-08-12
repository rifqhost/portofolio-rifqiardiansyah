// FILE: server/middleware/rateLimit.js
import express from 'express'

export function rateLimit(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000
  const max = options.max || 100
  const message = options.message || 'Too many requests'

  const requests = new Map()

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    const timestamps = requests.get(key) || []
    const recent = timestamps.filter((t) => t > windowStart)

    if (recent.length >= max) {
      return res.status(429).json({ success: false, error: { message } })
    }

    recent.push(now)
    requests.set(key, recent)
    next()
  }
}
