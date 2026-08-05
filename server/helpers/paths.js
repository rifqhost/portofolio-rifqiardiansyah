// FILE: server/helpers/paths.js
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const SERVER_DIR = path.join(__dirname, '..')
export const ROOT_DIR = path.join(SERVER_DIR, '..')
export const DATA_DIR = path.join(ROOT_DIR, 'data')
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

export const resolveData = (file) => path.join(DATA_DIR, file)
