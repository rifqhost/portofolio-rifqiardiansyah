// FILE: server/utils/logger.js
const LEVELS = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' }

const ts = () => new Date().toISOString()

const log = (level, msg, ...args) => {
  const color = LEVELS[level] || ''
  console.log(`${color}[${ts()}] [${level.toUpperCase()}]${LEVELS.reset} ${msg}`, ...args)
}

export const logger = {
  info: (msg, ...args) => log('info', msg, ...args),
  ok: (msg, ...args) => log('ok', msg, ...args),
  warn: (msg, ...args) => log('warn', msg, ...args),
  error: (msg, ...args) => log('error', msg, ...args),
}
