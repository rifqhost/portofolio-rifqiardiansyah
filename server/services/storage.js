// FILE: server/services/storage.js
import fs from 'fs/promises'
import { DATA_DIR, resolveData } from '../helpers/paths.js'

export async function readJson(filename, fallback = null) {
  try {
    const raw = await fs.readFile(resolveData(filename), 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

export async function writeJson(filename, data) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const raw = JSON.stringify(data, null, 2)
  await fs.writeFile(resolveData(filename), raw, 'utf8')
  return data
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function removeFileIfExists(filePath) {
  try {
    await fs.unlink(filePath)
    return true
  } catch {
    return false
  }
}
