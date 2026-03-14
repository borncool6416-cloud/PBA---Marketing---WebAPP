import { EnrollmentData } from '../types'

interface EnrollmentProgressProps {
  enrollment: EnrollmentData
}

export default function EnrollmentProgress({ enrollment }: EnrollmentProgressProps) {
  const total = enrollment.newCairo + enrollment.maadi + enrollment.sheikhZayed
  const target = 80

  const branches = [
    { name: 'New Cairo', value: enrollment.newCairo, color: 'bg-blue-500' },
    { name: 'Maadi', value: enrollment.maadi, color: 'bg-purple-500' },
    { name: 'Sheikh Zayed', value: enrollment.sheikhZayed, color: 'bg-pink-500' },
  ]

  const progress = (total / target) * 100

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">Enrollment Progress</h3>
      
      <div className="space-y-4">
        {/* Overall progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-jost text-gray-700">Total Active Students</span>
            <span className="text-lg font-cormorant font-bold text-pba-burgundy">{total}/{target}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-pba-burgundy"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-pba-gray mt-1">{progress.toFixed(0)}% of target</p>
        </div>

        {/* Branch breakdown */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {branches.map((branch) => (
            <div key={branch.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${branch.color}`} />
                <span className="text-sm font-jost text-gray-700">{branch.name}</span>
              </div>
              <span className="text-sm font-jost font-semibold text-gray-800">{branch.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
