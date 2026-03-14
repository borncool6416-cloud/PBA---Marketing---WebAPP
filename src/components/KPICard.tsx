import { KPI } from '../types'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  kpi: KPI
  status: 'green' | 'amber' | 'red'
}

export default function KPICard({ kpi, status }: KPICardProps) {
  const percentage = (kpi.current / kpi.target) * 100
  const isAboveTarget = kpi.current >= kpi.target

  const statusColors = {
    green: 'border-green-500 bg-green-50',
    amber: 'border-amber-500 bg-amber-50',
    red: 'border-red-500 bg-red-50',
  }

  const statusIndicators = {
    green: '🟢',
    amber: '🟡',
    red: '🔴',
  }

  return (
    <div className={`border-l-4 ${statusColors[status]} p-4 rounded-lg`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-jost font-semibold text-gray-800">{kpi.name}</h3>
        <span className="text-lg">{statusIndicators[status]}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-cormorant font-bold text-pba-burgundy">
            {kpi.current.toFixed(kpi.unit === '%' ? 1 : 0)}
          </span>
          <span className="text-xs text-pba-gray">{kpi.unit}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span>Target: {kpi.target.toFixed(kpi.unit === '%' ? 1 : 0)} {kpi.unit}</span>
          {isAboveTarget ? (
            <TrendingUp size={14} className="text-green-600" />
          ) : (
            <TrendingDown size={14} className="text-red-600" />
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${
              status === 'green' ? 'bg-green-500' : status === 'amber' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="text-xs text-gray-600">
          {percentage.toFixed(0)}% of target
        </div>
      </div>

      {kpi.priority === 'CRITICAL' && (
        <div className="mt-2 text-xs font-jost font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">
          CRITICAL
        </div>
      )}
    </div>
  )
}
