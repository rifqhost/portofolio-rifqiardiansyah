// FILE: server/controllers/authController.js
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, fail } from '../helpers/response.js'
import { getJwtSecret, sha256, loadConfig } from '../helpers/config.js'
import { verifyAdminCredentials } from '../helpers/config.js'
import { writeJson } from '../services/storage.js'

const TOKEN_TTL = '7d'

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return fail(res, 400, 'Username and password are required')

  const valid = await verifyAdminCredentials(username, password)
  if (!valid) return fail(res, 401, 'Invalid username or password')

  const token = jwt.sign({ sub: username, role: 'admin' }, getJwtSecret(), { expiresIn: TOKEN_TTL })
  ok(res, { token, user: { username } })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) return fail(res, 400, 'Current and new password are required')
  if (String(newPassword).length < 6) return fail(res, 400, 'New password must be at least 6 characters')

  const username = req.user?.sub || 'admin'
  const valid = await verifyAdminCredentials(username, currentPassword)
  if (!valid) return fail(res, 401, 'Current password is incorrect')

  const config = (await loadConfig()) || {}
  config.adminPasswordHash = sha256(newPassword)
  await writeJson('config.json', config)
  ok(res, { message: 'Password updated successfully' })
})
