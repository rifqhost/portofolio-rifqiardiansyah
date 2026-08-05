// FILE: server/index.js
import app from './app.js'
import { logger } from './utils/logger.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  logger.ok(`Portfolio server running on http://localhost:${PORT}`)
  logger.ok(`API base: http://localhost:${PORT}/api`)
  logger.ok(`Health check: http://localhost:${PORT}/api/health`)
})
