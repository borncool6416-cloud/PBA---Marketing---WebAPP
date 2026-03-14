import { useState, useEffect } from 'react'
import { parseMetaExport, generatePerformanceSummary } from '../utils/gemini'
import { loadPipeline, savePipeline, loadEnrollment, saveEnrollment, loadKPIs, saveKPIs } from '../utils/localStorage'
import { KPIDashboard, MetaPostData, WhatsAppPipeline, EnrollmentData } from '../types'
import MetaParseTab from '../components/MetaParseTab'
import WhatsAppTab from '../components/WhatsAppTab'
import KPIOverrideTab from '../components/KPIOverrideTab'

interface DataInputProps {
  geminiReady: boolean
  kpis: KPIDashboard
  onKPIUpdate: (kpis: KPIDashboard) => void
}

export default function DataInput({ geminiReady, kpis, onKPIUpdate }: DataInputProps) {
  const [activeTab, setActiveTab] = useState<'meta' | 'whatsapp' | 'kpi'>('meta')
  const [pipeline, setPipeline] = useState<WhatsAppPipeline>(loadPipeline())
  const [enrollment, setEnrollment] = useState<EnrollmentData>(loadEnrollment())
  const [localKpis, setLocalKpis] = useState<KPIDashboard>(kpis)

  const handleMetaParse = async (text: string) => {
    if (!geminiReady) {
      alert('Gemini API not configured. Please set your API key in Settings.')
      return
    }

    try {
      const parsed = await parseMetaExport(text)
      const summary = await generatePerformanceSummary(parsed)
      
      // Show results to user
      alert(`Parsed ${parsed.length} posts. Summary:\n\n${summary}`)
      
      // Could update KPIs based on parsed data
      console.log('Parsed Meta data:', parsed)
    } catch (error) {
      alert(`Error parsing Meta export: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handlePipelineUpdate = (updates: Partial<WhatsAppPipeline>) => {
    const updated = { ...pipeline, ...updates }
    setPipeline(updated)
    savePipeline(updated)
  }

  const handleEnrollmentUpdate = (updates: Partial<EnrollmentData>) => {
    const updated = { ...enrollment, ...updates }
    setEnrollment(updated)
    saveEnrollment(updated)
  }

  const handleKPIUpdate = (updates: Partial<KPIDashboard>) => {
    const updated = { ...localKpis, ...updates }
    setLocalKpis(updated)
    saveKPIs(updated)
    onKPIUpdate(updated)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-cormorant font-bold text-pba-burgundy">Data Input</h1>
        <p className="text-pba-gray text-sm mt-1">Manage KPIs, WhatsApp pipeline, and Meta performance data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2 font-jost font-semibold border-b-2 transition-all ${
            activeTab === 'meta'
              ? 'border-pba-burgundy text-pba-burgundy'
              : 'border-transparent text-pba-gray hover:text-gray-800'
          }`}
        >
          Meta Performance Paste
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 font-jost font-semibold border-b-2 transition-all ${
            activeTab === 'whatsapp'
              ? 'border-pba-burgundy text-pba-burgundy'
              : 'border-transparent text-pba-gray hover:text-gray-800'
          }`}
        >
          WhatsApp & Enrollment
        </button>
        <button
          onClick={() => setActiveTab('kpi')}
          className={`px-4 py-2 font-jost font-semibold border-b-2 transition-all ${
            activeTab === 'kpi'
              ? 'border-pba-burgundy text-pba-burgundy'
              : 'border-transparent text-pba-gray hover:text-gray-800'
          }`}
        >
          Manual KPI Override
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'meta' && (
          <MetaParseTab geminiReady={geminiReady} onParse={handleMetaParse} />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppTab 
            pipeline={pipeline} 
            enrollment={enrollment}
            onPipelineUpdate={handlePipelineUpdate}
            onEnrollmentUpdate={handleEnrollmentUpdate}
          />
        )}

        {activeTab === 'kpi' && (
          <KPIOverrideTab 
            kpis={localKpis}
            onUpdate={handleKPIUpdate}
          />
        )}
      </div>
    </div>
  )
}
