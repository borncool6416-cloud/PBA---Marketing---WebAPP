import { Post } from '../types'

interface PostingStreakProps {
  posts: Post[]
}

export default function PostingStreak({ posts }: PostingStreakProps) {
  // Get this week's posts (Sunday to Saturday)
  const today = new Date()
  const currentDay = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - currentDay)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayData = days.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayPosts = posts.filter(p => p.scheduledDate === dateStr && p.status === 'Posted')
    return {
      day,
      date: dateStr,
      hasPost: dayPosts.length > 0,
      postCount: dayPosts.length
    }
  })

  const postsThisWeek = dayData.filter(d => d.hasPost).length
  const isWarning = postsThisWeek < 3 && currentDay >= 3 // Wednesday or later

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Weekly Posting Streak</h3>
      
      <div className="space-y-4">
        {/* Target info */}
        <div className="text-sm text-pba-gray">
          Target: <span className="font-jost font-semibold text-pba-burgundy">5 posts/week</span>
        </div>

        {/* Day bars */}
        <div className="flex gap-2 justify-between">
          {dayData.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                  d.hasPost
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                {d.postCount > 0 && (
                  <span className="text-sm font-jost font-bold text-green-700">{d.postCount}</span>
                )}
              </div>
              <span className="text-xs font-jost text-pba-gray">{d.day}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-jost text-gray-700">This week:</span>
            <span className="text-lg font-cormorant font-bold text-pba-burgundy">{postsThisWeek}/5</span>
          </div>

          {isWarning && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-jost font-semibold">
                ⚠️ Below target for this week. Aim for 5 posts to meet KPI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
