import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMAGES_DIR = path.join(ROOT, 'client', 'public', 'images')

const tasks = [
  { src: 'project-cbt.jpeg', width: 800, quality: 70, format: 'webp' },
  { src: 'project-guestbook.jpeg', width: 800, quality: 70, format: 'webp' },
  { src: 'avatar.jpg', width: 400, quality: 60, format: 'webp' },
  { src: 'project-cbt.png', quality: 70, format: 'webp' },
  { src: 'project-cbt-2.png', quality: 70, format: 'webp' },
  { src: 'project-cbt-3.png', quality: 70, format: 'webp' },
  { src: 'project-guestbook.jpg', quality: 70, format: 'webp' },
  { src: 'project-guestbook-2.jpg', quality: 70, format: 'webp' },
  { src: 'project-guestbook-3.jpg', quality: 70, format: 'webp' },
]

const results = []

for (const task of tasks) {
  const inputPath = path.join(IMAGES_DIR, task.src)
  if (!fs.existsSync(inputPath)) {
    console.log(`[skip] ${task.src} (not found)`)
    continue
  }

  const nameWithoutExt = path.basename(task.src, path.extname(task.src))
  const outputName = `${nameWithoutExt}.${task.format}`
  const outputPath = path.join(IMAGES_DIR, outputName)

  let pipeline = sharp(inputPath)

  if (task.width) {
    const meta = await pipeline.metadata()
    if (meta.width && meta.width > task.width) {
      pipeline = pipeline.resize({ width: task.width, withoutEnlargement: true })
    }
  }

  pipeline = pipeline.toFormat(task.format, { quality: task.quality })

  await pipeline.toFile(outputPath)

  const originalSize = fs.statSync(inputPath).size
  const newSize = fs.statSync(outputPath).size
  const originalKB = (originalSize / 1024).toFixed(1)
  const newKB = (newSize / 1024).toFixed(1)
  const reduction = ((1 - newSize / originalSize) * 100).toFixed(1)

  results.push({
    original: task.src,
    output: outputName,
    originalSize: `${originalKB} KB`,
    newSize: `${newKB} KB`,
    reduction: `${reduction}%`,
  })

  console.log(`[ok] ${task.src} (${originalKB} KB) -> ${outputName} (${newKB} KB, -${reduction}%)`)
}

console.log('\n--- Summary ---')
for (const r of results) {
  console.log(`${r.original} -> ${r.output}: ${r.originalSize} -> ${r.newSize} (reduced ${r.reduction})`)
}
