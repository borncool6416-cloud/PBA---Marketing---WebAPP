import { useState } from 'react'
import { Upload } from 'lucide-react'

interface MetaParseTabProps {
  geminiReady: boolean
  onParse: (text: string) => void
}

export default function MetaParseTab({ geminiReady, onParse }: MetaParseTabProps) {
  const [pastedText, setPastedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleParse = async () => {
    if (!pastedText.trim()) {
      alert('Please paste Meta Business Suite export data')
      return
    }

    setIsLoading(true)
    try {
      await onParse(pastedText)
      setPastedText('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-cormorant font-bold text-gray-800 mb-4">Meta Business Suite Export</h2>
      
      {!geminiReady && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-jost">
            ⚠️ Gemini API is not configured. Please set your API key in Settings to use this feature.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
            Paste Meta Export Data
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your Meta Business Suite export here. Include post captions, metrics, and platform information..."
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
            {isLoading ? 'Parsing...' : 'Parse with Gemini'}
          </button>
          <button
            onClick={() => setPastedText('')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-jost font-semibold transition-all"
          >
            Clear
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-jost">
            <strong>How to use:</strong> Export your Instagram and Facebook posts from Meta Business Suite. The system will parse the data and extract metrics like reach, likes, hook rate, and engagement. Results will be displayed in a table for review before saving.
          </p>
        </div>
      </div>
    </div>
  )
}
