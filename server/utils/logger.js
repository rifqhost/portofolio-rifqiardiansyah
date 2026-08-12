// FILE: server/utils/logger.js
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

export const logger = {
  ok: (msg) => console.log(`${colors.green}[ok]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[error]${colors.reset} ${msg}`),
  warn: (msg) => console.warn(`${colors.yellow}[warn]${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}[info]${colors.reset} ${msg}`),
}
