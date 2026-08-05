// FILE: client/src/i18n/index.ts
import { id } from './id'
import { en } from './en'

export type Lang = 'id' | 'en'

export const translations = {
  id,
  en,
} as const

export type Translation = typeof id
