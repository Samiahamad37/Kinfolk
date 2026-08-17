export type Gender = 'male' | 'female' | 'other'
export type PrivacyLevel = 'public' | 'family' | 'close-family' | 'private'
export type NavPage =
  | 'dashboard'
  | 'family-tree'
  | 'family-members'
  | 'timeline'
  | 'photos'
  | 'events'
  | 'documents'
  | 'stories'
  | 'messages'
  | 'settings'

export interface Person {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  gender: Gender
  birthDate?: string
  birthYear?: number
  birthPlace?: string
  deathDate?: string
  deathYear?: number
  deathPlace?: string
  occupation?: string
  education?: string
  biography?: string
  isLiving: boolean
  generation: number
  privacy: PrivacyLevel
  email?: string
  phone?: string
  parentIds: string[]
  spouseIds: string[]
  childrenIds: string[]
  siblingIds: string[]
}

export interface FamilyEvent {
  id: string
  type: 'birth' | 'death' | 'marriage' | 'graduation' | 'reunion' | 'memorial' | 'move' | 'other'
  title: string
  date: string
  year: number
  month?: number
  day?: number
  location?: string
  personIds: string[]
  description?: string
}

export interface Photo {
  id: string
  url: string
  title: string
  year?: number
  location?: string
  personIds: string[]
  albumId: string
  description?: string
}

export interface Album {
  id: string
  title: string
  coverUrl: string
  count: number
  year?: string
  description?: string
}

export interface Story {
  id: string
  title: string
  excerpt: string
  content: string
  authorId: string
  date: string
  personIds: string[]
  tags: string[]
  readTime: number
}

export interface FamilyDocument {
  id: string
  title: string
  type: 'birth-cert' | 'marriage-cert' | 'death-cert' | 'military' | 'immigration' | 'census' | 'photo' | 'other'
  year?: number
  personIds: string[]
  fileSize: string
  description?: string
}
