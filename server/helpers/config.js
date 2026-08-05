// FILE: server/helpers/config.js
import crypto from 'crypto'
import { readJson } from '../services/storage.js'

export const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex')

export const getJwtSecret = () => process.env.JWT_SECRET || 'portfolio-dev-secret-change-in-production'

export async function loadConfig() {
  const file = (await readJson('config.json')) || {}
  return file
}

export async function verifyAdminCredentials(username, password) {
  const config = await loadConfig()
  const configUser = config.adminUsername || 'admin'
  const configHash = config.adminPasswordHash || ''
  const usernameOk = username === (process.env.ADMIN_USERNAME || configUser)
  const hash =
    process.env.ADMIN_PASSWORD !== undefined
      ? sha256(process.env.ADMIN_PASSWORD)
      : configHash
  return usernameOk && Boolean(hash) && sha256(password) === hash
}
