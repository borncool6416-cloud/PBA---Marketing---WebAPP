import { Post } from '../types'
import { Clock, Instagram, Facebook } from 'lucide-react'

interface ActivityPanelProps {
  posts: Post[]
}

export default function ActivityPanel({ posts }: ActivityPanelProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Posted':
        return 'bg-green-100 text-green-800'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'Held':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformIcon = (platform: string) => {
    if (platform.includes('Instagram')) return <Instagram size={16} className="text-pink-600" />
    if (platform.includes('Facebook')) return <Facebook size={16} className="text-blue-600" />
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Today's Activity</h3>
      
      {posts.length === 0 ? (
        <p className="text-sm text-pba-gray text-center py-8">No posts scheduled for today</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex gap-2 mt-1">
                {getPlatformIcon(post.platform)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-jost font-semibold text-pba-burgundy">{post.format}</span>
                  <span className="text-xs text-pba-gray">{post.pillar}</span>
                </div>
                <p className="text-sm text-gray-700 truncate">{post.caption.substring(0, 80)}...</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-pba-gray">
                  <Clock size={14} />
                  <span>{post.scheduledTime}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-jost font-semibold px-2 py-1 rounded ${getStatusBadgeColor(post.status)}`}>
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
