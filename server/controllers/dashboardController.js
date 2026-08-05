// FILE: server/controllers/dashboardController.js
import { readJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok } from '../helpers/response.js'

const count = (value) => (Array.isArray(value) ? value.length : 0)

export const getStats = asyncHandler(async (req, res) => {
  const [projects, blog, skills, education, experience, certificates, testimonials, config] = await Promise.all([
    readJson('projects.json', []),
    readJson('blog.json', []),
    readJson('skills.json', {}),
    readJson('education.json', []),
    readJson('experience.json', []),
    readJson('certificates.json', {}),
    readJson('testimonials.json', []),
    readJson('config.json', {}),
  ])

  const skillGroups = ['frontend', 'backend', 'tools']
  const skillCount = skillGroups.reduce((acc, group) => acc + count(skills[group]), 0)

  const latestProjects = (projects || []).slice(0, 5)
  const latestPosts = (blog || []).slice(0, 5)

  ok(res, {
    counts: {
      projects: count(projects),
      blog: count(blog),
      skills: skillCount,
      education: count(education),
      experience: count(experience),
      certificates: count(certificates.items),
      testimonials: count(testimonials),
      visitors: config.visitors || 0,
    },
    analytics: {
      enabled: config.features?.analytics !== false,
      placeholder: true,
      message: 'Analytics placeholder - connect a real analytics service later',
    },
    latestProjects,
    latestPosts,
  })
})
