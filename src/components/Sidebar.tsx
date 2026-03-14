import { BarChart3, FileText, Calendar, Edit3, Upload, BookOpen, Settings } from 'lucide-react'

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: any) => void
  onSettingsClick: () => void
  geminiReady: boolean
}

export default function Sidebar({ currentSection, onSectionChange, onSettingsClick, geminiReady }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'data-input', label: 'Data Input', icon: FileText },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'post-editor', label: 'Post Editor', icon: Edit3 },
    { id: 'content-upload', label: 'Content Upload', icon: Upload },
    { id: 'marketing-plan', label: 'Marketing Plan', icon: BookOpen },
  ]

  return (
    <div className="w-64 bg-pba-burgundy text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-pba-pink">
        <h1 className="text-2xl font-cormorant font-bold">PBA</h1>
        <p className="text-xs text-pba-pink mt-1">Marketing Ops</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-pba-pink text-pba-burgundy'
                  : 'text-white hover:bg-pba-pink hover:bg-opacity-20'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-jost">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-pba-pink space-y-2">
        {!geminiReady && (
          <div className="text-xs bg-red-900 bg-opacity-50 p-2 rounded text-red-200">
            ⚠️ Gemini API not configured
          </div>
        )}
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-pba-pink hover:bg-opacity-20 transition-all text-sm"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}
