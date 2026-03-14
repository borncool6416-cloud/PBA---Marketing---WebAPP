import { useState, useEffect } from 'react'
import { initializeGemini } from './utils/gemini'
import { loadSettings, loadKPIs, getDefaultKPIs, saveKPIs } from './utils/localStorage'
import Sidebar from './components/Sidebar'
import Dashboard from './sections/Dashboard'
import DataInput from './sections/DataInput'
import ContentCalendar from './sections/ContentCalendar'
import PostEditor from './sections/PostEditor'
import ContentUpload from './sections/ContentUpload'
import MarketingPlan from './sections/MarketingPlan'
import SettingsPanel from './components/SettingsPanel'

type Section = 'dashboard' | 'data-input' | 'calendar' | 'post-editor' | 'content-upload' | 'marketing-plan'

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [geminiReady, setGeminiReady] = useState(false)
  const [kpis, setKpis] = useState(getDefaultKPIs())

  useEffect(() => {
    // Initialize Gemini on app load
    const settings = loadSettings()
    if (settings.geminiApiKey) {
      try {
        initializeGemini(settings.geminiApiKey)
        setGeminiReady(true)
      } catch (error) {
        console.error('Failed to initialize Gemini:', error)
      }
    }

    // Load KPIs
    const loadedKpis = loadKPIs()
    setKpis(loadedKpis)
  }, [])

  const handleSettingsSave = (apiKey: string) => {
    if (apiKey) {
      try {
        initializeGemini(apiKey)
        setGeminiReady(true)
      } catch (error) {
        console.error('Failed to initialize Gemini:', error)
        setGeminiReady(false)
      }
    }
    setShowSettings(false)
  }

  const handleKPIUpdate = (updatedKpis: typeof kpis) => {
    setKpis(updatedKpis)
    saveKPIs(updatedKpis)
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard kpis={kpis} onKPIUpdate={handleKPIUpdate} />
      case 'data-input':
        return <DataInput geminiReady={geminiReady} kpis={kpis} onKPIUpdate={handleKPIUpdate} />
      case 'calendar':
        return <ContentCalendar />
      case 'post-editor':
        return <PostEditor geminiReady={geminiReady} />
      case 'content-upload':
        return <ContentUpload geminiReady={geminiReady} />
      case 'marketing-plan':
        return <MarketingPlan kpis={kpis} onKPIUpdate={handleKPIUpdate} />
      default:
        return <Dashboard kpis={kpis} onKPIUpdate={handleKPIUpdate} />
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        onSettingsClick={() => setShowSettings(true)}
        geminiReady={geminiReady}
      />
      
      <main className="flex-1 overflow-auto">
        {renderSection()}
      </main>

      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  )
}
