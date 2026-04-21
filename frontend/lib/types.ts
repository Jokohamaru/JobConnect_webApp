export interface UserProfile {
  name: string
  email: string
  phone: string
  dob: string
  gender: string
  address: string
  avatar: string
  aboutMe: string
}

export interface EducationItem {
  id: string
  school: string
  major: string
  degree: string
  startYear: string
  endYear: string
  description: string
}

export interface ExperienceItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface SkillItem {
  id: string
  name: string
  level: string
}

export interface LanguageItem {
  id: string
  language: string
  level: string
}
