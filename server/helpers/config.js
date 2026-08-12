// FILE: server/helpers/config.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { readJson } from '../services/storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')

export const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex')

export const getJwtSecret = () => process.env.JWT_SECRET || 'portfolio-dev-secret-change-in-production'

function readJsonFile(fileName) {
  const filePath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(filePath)) return {}
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function loadConfig() {
  const config = readJson('config.json') || {}
  return config
}

export async function loadAdminConfig() {
  const fileConfig = readJsonFile('admin-config.json')
  const config = readJson('config.json') || {}
  return {
    username: process.env.ADMIN_USERNAME || fileConfig.username || config.adminUsername || 'admin',
    passwordHash:
      process.env.ADMIN_PASSWORD !== undefined
        ? sha256(process.env.ADMIN_PASSWORD)
        : fileConfig.passwordHash || config.adminPasswordHash || '',
  }
}

export async function verifyAdminCredentials(username, password) {
  const { username: configUser, passwordHash } = await loadAdminConfig()
  const usernameOk = username === configUser
  const hashOk = Boolean(passwordHash) && sha256(password) === passwordHash
  return usernameOk && hashOk
}
