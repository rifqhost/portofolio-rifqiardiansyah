// FILE: server/helpers/response.js
export const ok = (res, data, meta) => res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) })

export const created = (res, data) => res.status(201).json({ success: true, data })

export const fail = (res, status = 400, message = 'Something went wrong') =>
  res.status(status).json({ success: false, error: { message } })

export const pageMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
})
