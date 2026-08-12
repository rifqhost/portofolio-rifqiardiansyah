// FILE: server/helpers/id.js
import crypto from 'crypto'

export const newId = (prefix = 'id') => `${prefix}-${crypto.randomBytes(8).toString('hex')}`

export const randomToken = (bytes = 16) => crypto.randomBytes(bytes).toString('hex')
