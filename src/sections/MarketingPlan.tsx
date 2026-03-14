import { useState, useEffect } from 'react'
import { loadActionItems, saveActionItems } from '../utils/localStorage'
import { KPIDashboard, ActionItem } from '../types'
import { CheckCircle2, Circle } from 'lucide-react'

interface MarketingPlanProps {
  kpis: KPIDashboard
  onKPIUpdate: (kpis: KPIDashboard) => void
}

const MARKETING_STAGES = [
  {
    stage: 1,
    title: 'Situation Analysis',
    description: 'Current state: 34 active students, 9.7K IG followers, low organic reach, high CPL'
  },
  {
    stage: 2,
    title: 'KPI Definition & Baselines',
    description: '11 KPIs tracked: Monthly Organic Clicks, Video Hook Rate, WhatsApp Booking Rate, Cost Per Lead, etc.'
  },
  {
    stage: 3,
    title: 'Audience Segmentation',
    description: 'Tier 1 (High Intent): Audition inquiries. Tier 2 (Warm): Website visitors. Tier 3 (Cold): Lookalike audiences'
  },
  {
    stage: 4,
    title: 'Content Pillars & Calendar',
    description: 'Authority, Student Progress, Education, Community, Enrollment CTA. 5 posts/week minimum'
  },
  {
    stage: 5,
    title: 'Paid Media Strategy',
    description: '40% awareness, 30% retargeting, 20% content, 10% testing. Budget: 2,000 EGP/month'
  },
  {
    stage: 6,
    title: 'Organic Growth Tactics',
    description: 'SEO optimization, Google Reviews, parent referrals, community partnerships'
  },
  {
    stage: 7,
    title: 'Conversion Optimization',
    description: 'Landing page simplification, WhatsApp follow-up sequence, booking automation'
  },
  {
    stage: 8,
    title: 'Critical Fixes (90-Day Sprints)',
    description: 'Fix WhatsApp sequence, simplify forms, redesign video hooks, launch retargeting, parent referrals'
  },
  {
    stage: 9,
    title: 'Measurement & Reporting',
    description: 'Weekly dashboards, monthly deep-dives, quarterly strategy reviews'
  },
  {
    stage: 10,
    title: 'Scaling & Optimization',
    description: 'Scale winning campaigns, test new channels, expand to 80+ students'
  }
]

const CONTENT_PILLARS = [
  {
    name: 'Authority & Credentials',
    description: 'Highlight founder credentials, Cairo Opera dancers, professional standards',
    frequency: '1x/week',
    example: 'Founder bio, team credentials, facility tour'
  },
  {
    name: 'Student Progress',
    description: 'Showcase student achievements, technique improvements, recitals',
    frequency: '2x/week',
    example: 'Before/after technique, student performances, competition results'
  },
  {
    name: 'Education & Insight',
    description: 'Educational content about ballet, technique tips, age-appropriate guidance',
    frequency: '1x/week',
    example: 'Technique tips, age recommendations, ballet myths debunked'
  },
  {
    name: 'Community & Prestige',
    description: 'Build community, celebrate milestones, create FOMO with exclusivity',
    frequency: '1x/week',
    example: 'Student spotlights, community events, exclusive previews'
  },
  {
    name: 'Enrollment & CTA',
    description: 'Direct calls-to-action, audition info, limited-time offers',
    frequency: '1x/week',
    example: 'Audition announcements, trial class promos, enrollment CTAs'
  }
]

export default function MarketingPlan({ kpis, onKPIUpdate }: MarketingPlanProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [expandedStage, setExpandedStage] = useState<number | null>(null)

  useEffect(() => {
    setActionItems(loadActionItems())
  }, [])

  const handleToggleActionItem = (id: string) => {
    const updated = actionItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setActionItems(updated)
    saveActionItems(updated)
  }

  const completedCount = actionItems.filter(item => item.completed).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Marketing Plan</h1>
        <p className="text-pba-gray text-sm mt-1">Complete integrated marketing strategy for Premier Ballet Academy</p>
      </div>

      {/* 10 Stages Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-cormorant font-bold text-gray-800 mb-6">10-Stage Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {MARKETING_STAGES.map((stage) => (
            <button
              key={stage.stage}
              onClick={() => setExpandedStage(expandedStage === stage.stage ? null : stage.stage)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                expandedStage === stage.stage
                  ? 'border-pba-burgundy bg-pba-pink bg-opacity-20'
                  : 'border-gray-200 hover:border-pba-burgundy'
              }`}
            >
              <div className="text-lg font-cormorant font-bold text-pba-burgundy">Stage {stage.stage}</div>
              <p className="text-sm font-jost font-semibold text-gray-800 mt-1">{stage.title}</p>
              {expandedStage === stage.stage && (
                <p className="text-xs text-pba-gray mt-2">{stage.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="mb-12">
        <h2 className="text-2xl font-cormorant font-bold text-gray-800 mb-6">Content Pillars</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CONTENT_PILLARS.map((pillar) => (
            <div key={pillar.name} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-jost font-bold text-pba-burgundy mb-2">{pillar.name}</h3>
              <p className="text-sm text-gray-700 mb-3">{pillar.description}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-jost font-semibold text-pba-gray">Frequency:</span>
                  <span className="ml-2 text-gray-700">{pillar.frequency}</span>
                </div>
                <div>
                  <span className="font-jost font-semibold text-pba-gray">Example:</span>
                  <span className="ml-2 text-gray-700">{pillar.example}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 90-Day Action Items */}
      <div className="mb-12">
        <h2 className="text-2xl font-cormorant font-bold text-gray-800 mb-2">90-Day Critical Fixes</h2>
        <p className="text-sm text-pba-gray mb-6">
          Stage 8: Priority actions to unlock 30-50% growth in enrollments and booking rate
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex-1 bg-gray-300 rounded-full h-2">
              <div
                className="bg-pba-burgundy h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / actionItems.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-jost font-semibold text-pba-burgundy">
              {completedCount}/{actionItems.length} Complete
            </span>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleToggleActionItem(item.id)}
                className="w-full flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all text-left"
              >
                {item.completed ? (
                  <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle size={24} className="text-pba-gray flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <h4 className={`font-jost font-semibold ${item.completed ? 'line-through text-pba-gray' : 'text-gray-800'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-sm mt-1 ${item.completed ? 'line-through text-pba-gray' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Targets Summary */}
      <div className="mb-12">
        <h2 className="text-2xl font-cormorant font-bold text-gray-800 mb-6">90-Day KPI Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(kpis).map((kpi) => (
            <div key={kpi.name} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-jost font-bold text-pba-burgundy mb-3">{kpi.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pba-gray">Current:</span>
                  <span className="font-jost font-semibold">{kpi.current} {kpi.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pba-gray">Target:</span>
                  <span className="font-jost font-semibold text-pba-burgundy">{kpi.target} {kpi.unit}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-pba-burgundy"
                    style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Rules */}
      <div className="bg-pba-pink bg-opacity-20 border border-pba-pink rounded-lg p-8">
        <h2 className="text-2xl font-cormorant font-bold text-pba-burgundy mb-6">Brand Voice & Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-jost font-bold text-gray-800 mb-3">✓ Do This</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Authoritative, refined, progress-focused language</li>
              <li>• Short punchy sentences with factual proof points</li>
              <li>• Institutional tone (Cairo Opera credentials)</li>
              <li>• Pain → Agitation → Solution → Proof → CTA structure</li>
              <li>• Use specific metrics and measurable results</li>
              <li>• Bold text/close-ups in first 3 seconds of video</li>
            </ul>
          </div>
          <div>
            <h3 className="font-jost font-bold text-gray-800 mb-3">✗ Never Do This</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• No exclamation marks</li>
              <li>• Never use the word "journey"</li>
              <li>• Avoid "free" as primary CTA</li>
              <li>• No casual or overly friendly tone</li>
              <li>• No vague claims without proof</li>
              <li>• No generic ballet academy language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
