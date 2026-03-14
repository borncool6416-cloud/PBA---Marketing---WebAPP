import { useState, useEffect } from 'react'
import { loadPosts, loadPipeline, loadEnrollment } from '../utils/localStorage'
import { getKPIStatusIndicator } from '../utils/brandRules'
import { KPIDashboard, Post, WhatsAppPipeline, EnrollmentData } from '../types'
import KPICard from '../components/KPICard'
import ActivityPanel from '../components/ActivityPanel'
import CampaignTracker from '../components/CampaignTracker'
import PostingStreak from '../components/PostingStreak'
import PipelineSummary from '../components/PipelineSummary'
import EnrollmentProgress from '../components/EnrollmentProgress'

interface DashboardProps {
  kpis: KPIDashboard
  onKPIUpdate: (kpis: KPIDashboard) => void
}

export default function Dashboard({ kpis, onKPIUpdate }: DashboardProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [pipeline, setPipeline] = useState<WhatsAppPipeline | null>(null)
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null)
  const [todaysPosts, setTodaysPosts] = useState<Post[]>([])

  useEffect(() => {
    // Load data
    setPosts(loadPosts())
    setPipeline(loadPipeline())
    setEnrollment(loadEnrollment())

    // Get today's posts
    const today = new Date().toISOString().split('T')[0]
    const todaysPostsList = loadPosts().filter(p => p.scheduledDate === today)
    setTodaysPosts(todaysPostsList)

    // Update post frequency KPI
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0]
    
    const postsThisWeek = loadPosts().filter(p => p.scheduledDate >= thisWeekStartStr && p.status === 'Posted')
    const updatedKpis = { ...kpis }
    updatedKpis['Post Frequency'].current = postsThisWeek.length
    onKPIUpdate(updatedKpis)
  }, [])

  const kpiArray = Object.values(kpis)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Dashboard</h1>
        <p className="text-pba-gray text-sm mt-1">Marketing Operations Control Center</p>
      </div>

      {/* KPI Cards Row */}
      <div>
        <h2 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiArray.map((kpi) => (
            <KPICard
              key={kpi.name}
              kpi={kpi}
              status={getKPIStatusIndicator(kpi.current, kpi.target)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Activity & Campaign */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Activity */}
          <ActivityPanel posts={todaysPosts} />

          {/* Campaign Tracker */}
          <CampaignTracker posts={posts} />
        </div>

        {/* Right Column - Metrics */}
        <div className="space-y-6">
          {/* Posting Streak */}
          <PostingStreak posts={posts} />

          {/* WhatsApp Pipeline */}
          {pipeline && <PipelineSummary pipeline={pipeline} />}

          {/* Enrollment Progress */}
          {enrollment && <EnrollmentProgress enrollment={enrollment} />}
        </div>
      </div>
    </div>
  )
}
