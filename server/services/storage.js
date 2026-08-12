// FILE: server/services/storage.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DATA_DIR, UPLOADS_DIR } from '../helpers/paths.js'
import { gitCommitAndPush } from './gitPersistence.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function readJson(fileName, fallback = null) {
  const filePath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(filePath)) return fallback
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  
  if (process.env.GIT_PERSISTENCE === 'true') {
    gitCommitAndPush(`Auto-save ${fileName}`)
  }
}

export async function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    return true
  }
  return false
}
