import { useState } from 'react'
import { KPIDashboard } from '../types'
import { Save } from 'lucide-react'

interface KPIOverrideTabProps {
  kpis: KPIDashboard
  onUpdate: (updates: Partial<KPIDashboard>) => void
}

export default function KPIOverrideTab({ kpis, onUpdate }: KPIOverrideTabProps) {
  const [localKpis, setLocalKpis] = useState(kpis)

  const handleKPIChange = (kpiName: string, value: number) => {
    setLocalKpis({
      ...localKpis,
      [kpiName]: {
        ...localKpis[kpiName],
        current: value
      }
    })
  }

  const handleSave = () => {
    onUpdate(localKpis)
    alert('All KPI values saved successfully!')
  }

  return (
    <div>
      <h2 className="text-xl font-cormorant font-bold text-gray-800 mb-4">Manual KPI Override</h2>
      <p className="text-sm text-pba-gray mb-6">Update any KPI value manually. Current values shown with targets.</p>
      
      <div className="space-y-4 mb-6">
        {Object.entries(localKpis).map(([key, kpi]) => {
          const percentage = (kpi.current / kpi.target) * 100
          const isOnTrack = percentage >= 80

          return (
            <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-jost font-semibold text-gray-800">{kpi.name}</h3>
                  <p className="text-xs text-pba-gray mt-1">
                    Target: {kpi.target} {kpi.unit} | Priority: {kpi.priority}
                  </p>
                </div>
                <span className={`text-xs font-jost font-semibold px-2 py-1 rounded ${
                  isOnTrack ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-jost text-gray-600 mb-1">Current Value</label>
                  <input
                    type="number"
                    step={kpi.unit === '%' ? '0.1' : '1'}
                    value={kpi.current}
                    onChange={(e) => handleKPIChange(key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy text-sm"
                  />
                </div>
                <div className="text-sm text-pba-gray">
                  / {kpi.target} {kpi.unit}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    isOnTrack ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-pba-burgundy text-white rounded-lg hover:bg-opacity-90 font-jost font-semibold transition-all"
        >
          <Save size={18} />
          Save All KPIs
        </button>
      </div>
    </div>
  )
}
