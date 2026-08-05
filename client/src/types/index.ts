// FILE: client/src/types/index.ts

export interface Socials {
  github: string
  linkedin: string
  whatsapp: string
  email: string
  discord: string
  instagram: string
}

export interface PersonalInfo {
  fullName: string
  role: string
  status: string
  location: string
  email: string
  education: string
  languages: string
}

export interface Highlight {
  icon: string
  title: string
  description: string
}

export interface ProfileSeo {
  title: string
  description: string
  keywords: string
  ogImage: string
  url: string
}

export interface Profile {
  name: string
  shortName: string
  initials: string
  role: string
  roles: string[]
  status: string
  avatar: string
  tagline: string
  about: string[]
  highlights: Highlight[]
  personalInfo: PersonalInfo
  socials: Socials
  cv: string
  stats: {
    projects: number
    techStack: number
    github: number
  }
  seo: ProfileSeo
}

export type ProjectStatus = 'completed' | 'in-progress' | 'draft' | string

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  features: string[]
  techStack: string[]
  category: string
  image: string
  gallery: string[]
  github: string
  demo: string
  status: ProjectStatus
  date: string
}

export interface Skill {
  name: string
  level: number
  icon: string
}

export interface Skills {
  frontend: Skill[]
  backend: Skill[]
  tools: Skill[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  period: string
  location: string
  description: string
  achievements: string[]
}

export interface Experience {
  id: string
  role: string
  company: string
  type: string
  period: string
  location: string
  current: boolean
  description: string
  skills: string[]
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover: string
  category: string
  tags: string[]
  author: string
  date: string
  readTime: number
  featured: boolean
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  date: string
  credentialUrl?: string
  image?: string
}

export interface Certificates {
  title: string
  subtitle: string
  comingSoon: boolean
  comingSoonTitle: string
  comingSoonDescription: string
  items: Certificate[]
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  message: string
  rating: number
  date: string
}

export interface SiteConfig {
  siteName: string
  defaultLang: string
  features: {
    visitorCounter: boolean
    analytics: boolean
    emailjs: boolean
  }
  emailjs: {
    serviceId: string
    templateId: string
    publicKey: string
  }
  visitors: number
}

export interface PageMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PageMeta
  error?: {
    message: string
  }
}

export interface DashboardStats {
  counts: {
    projects: number
    blog: number
    skills: number
    education: number
    experience: number
    certificates: number
    testimonials: number
    visitors: number
  }
  analytics: {
    enabled: boolean
    placeholder: boolean
    message: string
  }
  latestProjects: Project[]
  latestPosts: BlogPost[]
}

export interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}
