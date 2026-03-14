import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { loadPosts, addPost, updatePost } from '../utils/localStorage'
import { improveCaption } from '../utils/gemini'
import { validateBrandRules } from '../utils/brandRules'
import { Post, ContentPillar, Platform, PostFormat } from '../types'
import { AlertCircle, Wand2, Save, Trash2 } from 'lucide-react'

interface PostEditorProps {
  geminiReady: boolean
}

const PILLARS: ContentPillar[] = [
  'Authority & Credentials',
  'Student Progress',
  'Education & Insight',
  'Community & Prestige',
  'Enrollment & CTA'
]

const FORMATS: PostFormat[] = ['Reel', 'Photo', 'Carousel', 'Story']
const PLATFORMS: Platform[] = ['Instagram', 'Facebook', 'Both']

export default function PostEditor({ geminiReady }: PostEditorProps) {
  const [post, setPost] = useState<Partial<Post>>({
    id: uuidv4(),
    platform: 'Instagram',
    format: 'Reel',
    pillar: 'Student Progress',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '19:00',
    caption: '',
    visual: '',
    hashtags: '',
    status: 'Scheduled',
  })

  const [brandViolations, setBrandViolations] = useState<any[]>([])
  const [improvedCaption, setImprovedCaption] = useState('')
  const [isImproving, setIsImproving] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Validate brand rules on caption change
  useEffect(() => {
    if (post.caption) {
      const violations = validateBrandRules(post.caption)
      setBrandViolations(violations)
    }
  }, [post.caption])

  const handleImproveCaption = async () => {
    if (!geminiReady) {
      alert('Gemini API not configured. Please set your API key in Settings.')
      return
    }

    if (!post.caption?.trim()) {
      alert('Please enter a caption first')
      return
    }

    setIsImproving(true)
    try {
      const improved = await improveCaption(post.caption)
      setImprovedCaption(improved)
    } catch (error) {
      alert(`Error improving caption: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsImproving(false)
    }
  }

  const handleAcceptImprovement = () => {
    setPost({ ...post, caption: improvedCaption })
    setImprovedCaption('')
  }

  const handleSavePost = () => {
    if (!post.caption?.trim()) {
      alert('Please enter a caption')
      return
    }

    setIsSaving(true)
    try {
      if (post.id && post.id.includes('-')) {
        // New post
        addPost(post as Post)
      } else {
        // Update existing
        updatePost(post.id!, post as Partial<Post>)
      }
      alert('Post saved successfully!')
      // Reset form
      setPost({
        id: uuidv4(),
        platform: 'Instagram',
        format: 'Reel',
        pillar: 'Student Progress',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '19:00',
        caption: '',
        visual: '',
        hashtags: '',
        status: 'Scheduled',
      })
      setImprovedCaption('')
    } catch (error) {
      alert(`Error saving post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Post Editor</h1>
        <p className="text-pba-gray text-sm mt-1">Create and edit social media posts with brand rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Metadata */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Post Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Platform</label>
                <select
                  value={post.platform}
                  onChange={(e) => setPost({ ...post, platform: e.target.value as Platform })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Format</label>
                <select
                  value={post.format}
                  onChange={(e) => setPost({ ...post, format: e.target.value as PostFormat })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                >
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Pillar</label>
                <select
                  value={post.pillar}
                  onChange={(e) => setPost({ ...post, pillar: e.target.value as ContentPillar })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                >
                  {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={post.status}
                  onChange={(e) => setPost({ ...post, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Posted">Posted</option>
                  <option value="Held">Held</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={post.scheduledDate}
                  onChange={(e) => setPost({ ...post, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={post.scheduledTime}
                  onChange={(e) => setPost({ ...post, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
                />
              </div>
            </div>
          </div>

          {/* Caption Editor */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Caption</h2>
            
            <textarea
              value={post.caption}
              onChange={(e) => setPost({ ...post, caption: e.target.value })}
              placeholder="Write your caption here. Follow the structure: Pain → Agitation → Solution → Proof → CTA"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-jost focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleImproveCaption}
                disabled={!geminiReady || isImproving || !post.caption?.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-jost font-semibold disabled:opacity-50 transition-all"
              >
                <Wand2 size={18} />
                {isImproving ? 'Improving...' : 'Improve with Gemini'}
              </button>
            </div>
          </div>

          {/* Visual Brief */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Visual Brief</h2>
            <textarea
              value={post.visual}
              onChange={(e) => setPost({ ...post, visual: e.target.value })}
              placeholder="Describe the visual content: what should the image or video show?"
              className="w-full h-24 p-4 border border-gray-300 rounded-lg font-jost focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
            />
          </div>

          {/* Hashtags */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Hashtags</h2>
            <textarea
              value={post.hashtags}
              onChange={(e) => setPost({ ...post, hashtags: e.target.value })}
              placeholder="#PremierBallet #BallletAcademy #Cairo"
              className="w-full h-16 p-4 border border-gray-300 rounded-lg font-jost focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
            />
          </div>
        </div>

        {/* Sidebar - Brand Rules & Suggestions */}
        <div className="space-y-6">
          {/* Brand Rules */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Brand Rules</h3>
            
            {brandViolations.length === 0 ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-jost">✓ All brand rules followed</p>
              </div>
            ) : (
              <div className="space-y-2">
                {brandViolations.map((violation, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex gap-2 ${
                    violation.severity === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <AlertCircle size={18} className={violation.severity === 'error' ? 'text-red-600' : 'text-amber-600'} />
                    <div>
                      <p className={`text-sm font-jost font-semibold ${
                        violation.severity === 'error' ? 'text-red-800' : 'text-amber-800'
                      }`}>
                        {violation.rule}
                      </p>
                      <p className={`text-xs ${
                        violation.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                      }`}>
                        {violation.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Improved Caption Suggestion */}
          {improvedCaption && (
            <div className="bg-white border border-blue-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-cormorant font-bold text-blue-900 mb-3">Gemini Suggestion</h3>
              <p className="text-sm text-blue-800 font-jost mb-4 p-3 bg-white rounded border border-blue-200">
                {improvedCaption}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptImprovement}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-jost text-sm font-semibold transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => setImprovedCaption('')}
                  className="flex-1 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 font-jost text-sm font-semibold transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSavePost}
            disabled={isSaving || !post.caption?.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pba-burgundy text-white rounded-lg hover:bg-opacity-90 font-jost font-semibold disabled:opacity-50 transition-all"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
