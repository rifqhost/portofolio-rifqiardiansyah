// FILE: server/helpers/paths.js
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const DATA_DIR = path.join(__dirname, '../../data')
export const UPLOADS_DIR = path.join(__dirname, '../../client/public/uploads')
