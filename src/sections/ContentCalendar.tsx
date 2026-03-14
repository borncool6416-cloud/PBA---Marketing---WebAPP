import { useState, useEffect } from 'react'
import { loadPosts, updatePost, deletePost, loadHeldPosts, saveHeldPosts } from '../utils/localStorage'
import { Post } from '../types'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const CONTENT_PILLARS = {
  'Education & Insight': 'bg-blue-100 border-blue-300',
  'Student Progress': 'bg-green-100 border-green-300',
  'Authority & Credentials': 'bg-purple-100 border-purple-300',
  'Community & Prestige': 'bg-pink-100 border-pink-300',
  'Enrollment & CTA': 'bg-orange-100 border-orange-300',
}

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [heldPosts, setHeldPosts] = useState<Post[]>([])
  const [showHeldPosts, setShowHeldPosts] = useState(false)

  useEffect(() => {
    setPosts(loadPosts())
    setHeldPosts(loadHeldPosts())
  }, [])

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
    return d
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  const getPostsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return posts.filter(p => p.scheduledDate === dateStr)
  }

  const handleMarkAsPosted = (postId: string) => {
    updatePost(postId, { status: 'Posted' })
    setPosts(loadPosts())
  }

  const handleHoldPost = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      const updated = [...heldPosts, { ...post, status: 'Held' as const }]
      setHeldPosts(updated)
      saveHeldPosts(updated)
      deletePost(postId)
      setPosts(loadPosts())
    }
  }

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(postId)
      setPosts(loadPosts())
    }
  }

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Content Calendar</h1>
        <p className="text-pba-gray text-sm mt-1">Weekly content planning and scheduling</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeft size={24} className="text-pba-burgundy" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-cormorant font-bold text-gray-800">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <p className="text-sm text-pba-gray">Week of {weekStart.toLocaleDateString('en-US', { weekday: 'long' })}</p>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronRight size={24} className="text-pba-burgundy" />
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
        {weekDays.map((date, dayIndex) => {
          const dayPosts = getPostsForDay(date)
          const dayName = DAYS_OF_WEEK[dayIndex]
          const expectedPillar = getExpectedPillar(dayIndex)

          return (
            <div key={dayIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Day Header */}
              <div className="bg-pba-burgundy text-white p-3">
                <h3 className="font-jost font-semibold text-sm">{dayName}</h3>
                <p className="text-xs text-pba-pink">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                {expectedPillar && (
                  <p className="text-xs text-pba-pink mt-1">📌 {expectedPillar}</p>
                )}
              </div>

              {/* Posts */}
              <div className="p-3 space-y-2 min-h-64">
                {dayPosts.length === 0 ? (
                  <p className="text-xs text-pba-gray text-center py-8">No posts scheduled</p>
                ) : (
                  dayPosts.map(post => (
                    <div
                      key={post.id}
                      className={`p-2 rounded-lg border-l-4 text-xs ${
                        CONTENT_PILLARS[post.pillar as keyof typeof CONTENT_PILLARS] || 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-1 mb-1">
                            <span className="font-jost font-semibold text-pba-burgundy">{post.format}</span>
                            <span className="text-pba-gray">•</span>
                            <span className="text-pba-gray">{post.scheduledTime}</span>
                          </div>
                          <p className="text-gray-700 truncate">{post.caption.substring(0, 50)}...</p>
                          <div className="mt-1 flex gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              post.status === 'Posted' ? 'bg-green-200 text-green-800' :
                              post.status === 'Held' ? 'bg-amber-200 text-amber-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {post.status === 'Scheduled' && (
                            <>
                              <button
                                onClick={() => handleMarkAsPosted(post.id)}
                                className="p-1 hover:bg-green-100 rounded text-green-600"
                                title="Mark as Posted"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleHoldPost(post.id)}
                                className="p-1 hover:bg-amber-100 rounded text-amber-600"
                                title="Hold"
                              >
                                ⏸
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Held Posts Tray */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowHeldPosts(!showHeldPosts)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all"
        >
          <h3 className="font-jost font-semibold text-gray-800">
            Held Posts ({heldPosts.length})
          </h3>
          <span className="text-pba-burgundy">{showHeldPosts ? '▼' : '▶'}</span>
        </button>

        {showHeldPosts && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            {heldPosts.length === 0 ? (
              <p className="text-sm text-pba-gray text-center py-4">No held posts</p>
            ) : (
              heldPosts.map(post => (
                <div key={post.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-jost font-semibold text-gray-800">{post.caption.substring(0, 60)}...</h4>
                      <p className="text-xs text-pba-gray mt-1">{post.format} • {post.pillar}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-jost hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getExpectedPillar(dayIndex: number): string | null {
  const pillars: { [key: number]: string } = {
    0: 'Education & Insight',
    1: 'Student Progress',
    2: 'Authority & Credentials',
    3: 'Community & Prestige',
    4: 'Enrollment & CTA',
    5: 'Student Progress',
    6: 'Flexible'
  }
  return pillars[dayIndex] || null
}
