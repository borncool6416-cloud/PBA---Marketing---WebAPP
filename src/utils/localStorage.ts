import { Post, KPIDashboard, WhatsAppPipeline, ActionItem, AppSettings, EnrollmentData } from '../types'

const STORAGE_KEYS = {
  POSTS: 'pba_posts',
  KPIS: 'pba_kpis',
  PIPELINE: 'pba_pipeline',
  ACTION_ITEMS: 'pba_action_items',
  HELD_POSTS: 'pba_held_posts',
  ENROLLMENT: 'pba_enrollment',
  SETTINGS: 'pba_settings',
}

// KPI Management
export const loadKPIs = (): KPIDashboard => {
  const stored = localStorage.getItem(STORAGE_KEYS.KPIS)
  return stored ? JSON.parse(stored) : getDefaultKPIs()
}

export const saveKPIs = (kpis: KPIDashboard) => {
  localStorage.setItem(STORAGE_KEYS.KPIS, JSON.stringify(kpis))
}

export const getDefaultKPIs = (): KPIDashboard => ({
  'Monthly Organic Clicks': { name: 'Monthly Organic Clicks', current: 0, target: 100, priority: 'CRITICAL', unit: 'clicks' },
  'Video Hook Rate': { name: 'Video Hook Rate', current: 15.56, target: 40, priority: 'CRITICAL', unit: '%' },
  'WhatsApp Booking Rate': { name: 'WhatsApp Booking Rate', current: 8.3, target: 25, priority: 'CRITICAL', unit: '%' },
  'Cost Per Lead': { name: 'Cost Per Lead', current: 18.43, target: 12, priority: 'HIGH', unit: 'EGP' },
  'Monthly Paid Reach': { name: 'Monthly Paid Reach', current: 43000, target: 150000, priority: 'HIGH', unit: 'reach' },
  'Day-30 Retention': { name: 'Day-30 Retention', current: 0, target: 5, priority: 'HIGH', unit: '%' },
  'Google Reviews': { name: 'Google Reviews', current: 23, target: 50, priority: 'HIGH', unit: 'reviews' },
  'Rank Math Score': { name: 'Rank Math Score', current: 25, target: 70, priority: 'HIGH', unit: 'score' },
  'New Enrollments/Month': { name: 'New Enrollments/Month', current: 1, target: 8, priority: 'CRITICAL', unit: 'students' },
  'Post Frequency': { name: 'Post Frequency', current: 0, target: 5, priority: 'HIGH', unit: 'posts/week' },
  'Instagram Followers': { name: 'Instagram Followers', current: 9714, target: 12000, priority: 'MEDIUM', unit: 'followers' },
})

// Posts Management
export const loadPosts = (): Post[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.POSTS)
  return stored ? JSON.parse(stored) : []
}

export const savePosts = (posts: Post[]) => {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
}

export const addPost = (post: Post) => {
  const posts = loadPosts()
  posts.push(post)
  savePosts(posts)
}

export const updatePost = (id: string, updates: Partial<Post>) => {
  const posts = loadPosts()
  const index = posts.findIndex(p => p.id === id)
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates }
    savePosts(posts)
  }
}

export const deletePost = (id: string) => {
  const posts = loadPosts()
  savePosts(posts.filter(p => p.id !== id))
}

// Held Posts Management
export const loadHeldPosts = (): Post[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.HELD_POSTS)
  return stored ? JSON.parse(stored) : []
}

export const saveHeldPosts = (posts: Post[]) => {
  localStorage.setItem(STORAGE_KEYS.HELD_POSTS, JSON.stringify(posts))
}

// WhatsApp Pipeline Management
export const loadPipeline = (): WhatsAppPipeline => {
  const stored = localStorage.getItem(STORAGE_KEYS.PIPELINE)
  return stored ? JSON.parse(stored) : { inquiriesThisWeek: 0, auditionsBooked: 0, auditionsAttended: 0, newEnrollments: 0 }
}

export const savePipeline = (pipeline: WhatsAppPipeline) => {
  localStorage.setItem(STORAGE_KEYS.PIPELINE, JSON.stringify(pipeline))
}

// Enrollment Data Management
export const loadEnrollment = (): EnrollmentData => {
  const stored = localStorage.getItem(STORAGE_KEYS.ENROLLMENT)
  return stored ? JSON.parse(stored) : { newCairo: 0, maadi: 0, sheikhZayed: 0 }
}

export const saveEnrollment = (enrollment: EnrollmentData) => {
  localStorage.setItem(STORAGE_KEYS.ENROLLMENT, JSON.stringify(enrollment))
}

// Action Items Management
export const loadActionItems = (): ActionItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTION_ITEMS)
  return stored ? JSON.parse(stored) : getDefaultActionItems()
}

export const saveActionItems = (items: ActionItem[]) => {
  localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(items))
}

export const getDefaultActionItems = (): ActionItem[] => [
  { id: '1', title: 'Fix 1 — WhatsApp follow-up sequence', description: 'Reply <2hr, Day 3, Day 7 → +30–50% booking rate', completed: false, stage: 8 },
  { id: '2', title: 'Fix 2 — Simplify landing page to 3-field form', description: 'Name, age, branch → removes #1 friction', completed: false, stage: 8 },
  { id: '3', title: 'Fix 3 — Redesign video hooks', description: 'Bold text/correction close-up in first 3 seconds', completed: false, stage: 8 },
  { id: '4', title: 'Fix 4 — Launch retargeting ads', description: 'Video viewers + site visitors → re-engages warm leads', completed: false, stage: 8 },
  { id: '5', title: 'Fix 5 — Parent referral mechanism', description: 'From existing 34 students → zero-cost acquisition', completed: false, stage: 8 },
  { id: '6', title: 'Fix 6 — Budget reallocation', description: '40% awareness / 30% retargeting / 20% content / 10% testing', completed: false, stage: 8 },
]

// Settings Management
export const loadSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return stored ? JSON.parse(stored) : { geminiApiKey: '' }
}

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}
