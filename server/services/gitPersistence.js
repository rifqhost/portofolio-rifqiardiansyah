// FILE: server/services/gitPersistence.js
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DATA_DIR } from '../helpers/paths.js'
import { logger } from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../../')

function runGit(command) {
  try {
    const env = { ...process.env }
    if (process.env.GITHUB_TOKEN) {
      env.GIT_ASKPASS = 'echo'
      env.GIT_AUTHOR_NAME = 'Portfolio Bot'
      env.GIT_AUTHOR_EMAIL = 'bot@portfolio.local'
      env.GIT_COMMITTER_NAME = 'Portfolio Bot'
      env.GIT_COMMITTER_EMAIL = 'bot@portfolio.local'
    }
    return execSync(command, {
      cwd: ROOT,
      encoding: 'utf-8',
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    logger.warn(`Git command failed: ${command}`)
    return null
  }
}

export async function gitPull() {
  try {
    if (process.env.GITHUB_TOKEN) {
      const remoteUrl = process.env.GITHUB_TOKEN.includes('@')
        ? process.env.GITHUB_TOKEN
        : `https://${process.env.GITHUB_TOKEN}@github.com/rifqhost/portofolio-rifqiardiansyah.git`
      runGit(`git remote set-url origin ${remoteUrl}`)
    }
    const result = runGit('git pull --rebase origin main')
    if (result) logger.ok('Git pull completed')
    return result
  } catch (error) {
    logger.warn('Git pull failed')
    return null
  }
}

export async function gitCommitAndPush(message) {
  try {
    if (process.env.GITHUB_TOKEN) {
      const remoteUrl = process.env.GITHUB_TOKEN.includes('@')
        ? process.env.GITHUB_TOKEN
        : `https://${process.env.GITHUB_TOKEN}@github.com/rifqhost/portofolio-rifqiardiansyah.git`
      runGit(`git remote set-url origin ${remoteUrl}`)
    }
    runGit('git add data/*.json')
    const status = runGit('git status --porcelain')
    if (!status) {
      return { committed: false, message: 'No changes to commit' }
    }
    runGit(`git commit -m "${message}"`)
    const pushResult = runGit('git push origin main')
    logger.ok(`Data committed and pushed: ${message}`)
    return { committed: true, message: 'Data saved and synced' }
  } catch (error) {
    logger.error(`Git commit/push failed: ${error.message}`)
    return { committed: false, message: 'Failed to sync data' }
  }
}

export function isGitRepository() {
  return fs.existsSync(path.join(ROOT, '.git'))
}
