// FILE: server/middleware/rateLimit.js
import rateLimit from 'express-rate-limit'
import { fail } from '../helpers/response.js'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => fail(res, 429, 'Too many login attempts. Please try again later.'),
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => fail(res, 429, 'Too many requests. Please slow down.'),
})
