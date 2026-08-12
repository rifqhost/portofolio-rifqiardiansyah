// FILE: server/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export async function uploadToCloudinary(filePath, folder = 'portfolio') {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
      ],
    }

    cloudinary.uploader.upload(filePath, uploadOptions, (error, result) => {
      if (error) return reject(error)
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      })
    })
  })
}

export async function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
}

export function isCloudinaryUrl(url) {
  return /res\.cloudinary\.com/.test(url)
}

export function extractPublicIdFromUrl(url) {
  const match = url.match(/\/v\d+\/(.+?)\./)
  return match ? match[1] : null
}
