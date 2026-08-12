// FILE: server/middleware/auth.js
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../helpers/config.js'
import { fail } from '../helpers/response.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return fail(res, 401, 'Authentication required')
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    req.user = payload
    return next()
  } catch {
    return fail(res, 401, 'Invalid or expired token')
  }
}
