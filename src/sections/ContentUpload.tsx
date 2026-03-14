import { useState } from 'react'
import { parseContentUpload } from '../utils/gemini'
import { addPost } from '../utils/localStorage'
import { v4 as uuidv4 } from 'uuid'
import { Upload, Download } from 'lucide-react'

interface ParsedPost {
  date: string
  time: string
  platform: string
  format: string
  pillar: string
  campaign?: string
  caption: string
  visual: string
  hashtags: string
}

const UPLOAD_FORMAT_TEMPLATE = `POST
Date: 2026-03-15
Time: 19:00
Platform: Instagram
Format: Reel
Pillar: Student Progress
Campaign: April Competition
Caption: Your child's technique is improving. But is it being measured?

Every midterm, our students receive written development reports. Not feedback. Not vague comments. Documented progress.

That's how you know your investment is working.

New Cairo · Maadi · Sheikh Zayed
Book an audition: [link]
#PremierBallet #BallletAcademy
Visual: Student performing a technique correction, close-up of feet in proper position
Hashtags: #PremierBallet #BallletAcademy #CairoBalletAcademy
---
POST
Date: 2026-03-16
Time: 19:00
Platform: Both
Format: Carousel
Pillar: Education & Insight
Campaign: None
Caption: What age should your child start ballet?

The short answer: age 3.

The real answer: it depends on your child's readiness. Some 3-year-olds thrive. Others benefit from waiting until 4 or 5.

We assess readiness in a trial class. No pressure. Just observation.

New Cairo · Maadi · Sheikh Zayed
Book a trial: [link]
Visual: Carousel showing different age groups in ballet classes, progression from young to older students
Hashtags: #BallletForKids #BallletAcademy #CairoBalletAcademy
---`

export default function ContentUpload({ geminiReady }: { geminiReady: boolean }) {
  const [pastedText, setPastedText] = useState('')
  const [parsedPosts, setParsedPosts] = useState<ParsedPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleParse = async () => {
    if (!pastedText.trim()) {
      alert('Please paste content in the required format')
      return
    }

    if (!geminiReady) {
      alert('Gemini API not configured. Please set your API key in Settings.')
      return
    }

    setIsLoading(true)
    try {
      const parsed = await parseContentUpload(pastedText)
      setParsedPosts(parsed)
      setShowPreview(true)
    } catch (error) {
      alert(`Error parsing content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadIntoCalendar = () => {
    let successCount = 0
    
    parsedPosts.forEach(p => {
      try {
        addPost({
          id: uuidv4(),
          platform: p.platform as any,
          format: p.format as any,
          pillar: p.pillar as any,
          campaign: p.campaign || undefined,
          scheduledDate: p.date,
          scheduledTime: p.time,
          caption: p.caption,
          visual: p.visual,
          hashtags: p.hashtags,
          status: 'Scheduled',
        })
        successCount++
      } catch (error) {
        console.error('Error adding post:', error)
      }
    })

    alert(`Successfully loaded ${successCount}/${parsedPosts.length} posts into the calendar!`)
    setPastedText('')
    setParsedPosts([])
    setShowPreview(false)
  }

  const downloadTemplate = () => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(UPLOAD_FORMAT_TEMPLATE))
    element.setAttribute('download', 'content_upload_template.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Content Upload</h1>
        <p className="text-pba-gray text-sm mt-1">Bulk upload multiple posts at once</p>
      </div>

      {!showPreview ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-cormorant font-bold text-gray-800 mb-4">Upload Format</h2>
            
            {!geminiReady && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-jost">
                  ⚠️ Gemini API is not configured. Please set your API key in Settings to use this feature.
                </p>
              </div>
            )}

            <p className="text-sm text-pba-gray mb-4">
              Each post should be separated by <code className="bg-gray-100 px-2 py-1 rounded">---</code>. Use this format:
            </p>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 font-mono text-xs mb-4 overflow-x-auto max-h-40">
              <pre>{UPLOAD_FORMAT_TEMPLATE}</pre>
            </div>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-pba-burgundy text-pba-burgundy rounded-lg hover:bg-pba-pink hover:bg-opacity-30 font-jost font-semibold transition-all mb-6"
            >
              <Download size={18} />
              Download Format Template
            </button>
          </div>

          <div>
            <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
              Paste Your Posts
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your formatted posts here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pba-burgundy disabled:opacity-50"
              disabled={!geminiReady || isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleParse}
              disabled={!geminiReady || isLoading || !pastedText.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-pba-burgundy text-white rounded-lg hover:bg-opacity-90 font-jost font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Upload size={18} />
              {isLoading ? 'Parsing...' : 'Parse & Preview'}
            </button>
            <button
              onClick={() => setPastedText('')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-jost font-semibold transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-cormorant font-bold text-gray-800 mb-4">Preview ({parsedPosts.length} posts)</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedPosts.map((post, i) => (
                <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-pba-gray font-jost">Date & Time</p>
                      <p className="font-jost font-semibold">{post.date} {post.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-pba-gray font-jost">Platform • Format</p>
                      <p className="font-jost font-semibold">{post.platform} • {post.format}</p>
                    </div>
                    <div>
                      <p className="text-xs text-pba-gray font-jost">Pillar</p>
                      <p className="font-jost font-semibold">{post.pillar}</p>
                    </div>
                    {post.campaign && (
                      <div>
                        <p className="text-xs text-pba-gray font-jost">Campaign</p>
                        <p className="font-jost font-semibold">{post.campaign}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-pba-gray font-jost mb-1">Caption</p>
                    <p className="text-sm text-gray-700">{post.caption.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLoadIntoCalendar}
              className="flex-1 px-6 py-3 bg-pba-burgundy text-white rounded-lg hover:bg-opacity-90 font-jost font-semibold transition-all"
            >
              Load into Calendar
            </button>
            <button
              onClick={() => {
                setParsedPosts([])
                setShowPreview(false)
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-jost font-semibold transition-all"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
