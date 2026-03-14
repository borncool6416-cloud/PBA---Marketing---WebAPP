import { Post } from '../types'

interface CampaignTrackerProps {
  posts: Post[]
}

export default function CampaignTracker({ posts }: CampaignTrackerProps) {
  // Get active campaigns from posts
  const campaigns = new Map<string, Post[]>()
  posts.forEach(post => {
    if (post.campaign) {
      if (!campaigns.has(post.campaign)) {
        campaigns.set(post.campaign, [])
      }
      campaigns.get(post.campaign)!.push(post)
    }
  })

  if (campaigns.size === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Active Campaigns</h3>
        <p className="text-sm text-pba-gray text-center py-8">No active campaigns</p>
      </div>
    )
  }

  const activeCampaigns = Array.from(campaigns.entries()).slice(0, 3)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Active Campaigns</h3>
      
      <div className="space-y-4">
        {activeCampaigns.map(([campaignName, campaignPosts]) => {
          const postedCount = campaignPosts.filter(p => p.status === 'Posted').length
          const totalCount = campaignPosts.length
          const progress = (postedCount / totalCount) * 100

          return (
            <div key={campaignName} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-jost font-semibold text-gray-800">{campaignName}</h4>
                <span className="text-xs font-jost text-pba-gray">{postedCount}/{totalCount} posts</span>
              </div>

              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-pba-burgundy"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-pba-gray mt-2">
                {Math.round(progress)}% complete
              </p>

              {campaignPosts.length > 0 && (
                <div className="mt-2 text-xs text-pba-gray">
                  Next: {campaignPosts.find(p => p.status === 'Scheduled')?.scheduledDate || 'No scheduled posts'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
