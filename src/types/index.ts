// KPI Types
export interface KPI {
  name: string
  current: number
  target: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  unit?: string
}

export interface KPIDashboard {
  [key: string]: KPI
}

// Post Types
export type Platform = 'Instagram' | 'Facebook' | 'Both'
export type PostFormat = 'Reel' | 'Photo' | 'Carousel' | 'Story'
export type PostStatus = 'Scheduled' | 'Posted' | 'Held' | 'Rescheduled'
export type ContentPillar = 'Authority & Credentials' | 'Student Progress' | 'Education & Insight' | 'Community & Prestige' | 'Enrollment & CTA'

export interface Post {
  id: string
  platform: Platform
  format: PostFormat
  pillar: ContentPillar
  campaign?: string
  scheduledDate: string
  scheduledTime: string
  caption: string
  visual: string
  hashtags: string
  status: PostStatus
  reach?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  hookRate?: number
  videoViews?: number
  avgWatchTime?: number
}

// Campaign Types
export interface Campaign {
  id: string
  name: string
  startDate: string
  endDate: string
  objective: string
  budget?: number
  color: string
  posts: string[]
}

// WhatsApp Pipeline Types
export interface WhatsAppPipeline {
  inquiriesThisWeek: number
  auditionsBooked: number
  auditionsAttended: number
  newEnrollments: number
}

// Enrollment Data Types
export interface EnrollmentData {
  newCairo: number
  maadi: number
  sheikhZayed: number
}

// Action Item Types
export interface ActionItem {
  id: string
  title: string
  description: string
  completed: boolean
  stage: number
}

// Meta Performance Data
export interface MetaPostData {
  platform: 'Instagram' | 'Facebook'
  type: PostFormat
  date: string
  time: string
  caption_preview: string
  reach: number
  likes: number
  comments: number
  shares: number
  impressions: number
  video_views?: number
  avg_watch_time?: number
  hook_rate?: number
  saves: number
  follows: number
  profile_visits: number
}

// Settings Types
export interface AppSettings {
  geminiApiKey: string
}
