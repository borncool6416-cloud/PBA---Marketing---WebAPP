import { useState } from 'react'
import { WhatsAppPipeline, EnrollmentData } from '../types'
import { Save } from 'lucide-react'

interface WhatsAppTabProps {
  pipeline: WhatsAppPipeline
  enrollment: EnrollmentData
  onPipelineUpdate: (updates: Partial<WhatsAppPipeline>) => void
  onEnrollmentUpdate: (updates: Partial<EnrollmentData>) => void
}

export default function WhatsAppTab({ 
  pipeline, 
  enrollment, 
  onPipelineUpdate,
  onEnrollmentUpdate 
}: WhatsAppTabProps) {
  const [localPipeline, setLocalPipeline] = useState(pipeline)
  const [localEnrollment, setLocalEnrollment] = useState(enrollment)

  const handleSave = () => {
    onPipelineUpdate(localPipeline)
    onEnrollmentUpdate(localEnrollment)
    alert('WhatsApp and enrollment data saved successfully!')
  }

  return (
    <div>
      <h2 className="text-xl font-cormorant font-bold text-gray-800 mb-6">WhatsApp & Enrollment Tracker</h2>
      
      <div className="space-y-8">
        {/* WhatsApp Pipeline Section */}
        <div>
          <h3 className="text-lg font-jost font-semibold text-gray-800 mb-4">This Week's Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                WhatsApp Inquiries
              </label>
              <input
                type="number"
                value={localPipeline.inquiriesThisWeek}
                onChange={(e) => setLocalPipeline({ ...localPipeline, inquiriesThisWeek: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
              <p className="text-xs text-pba-gray mt-1">Total inquiries received this week</p>
            </div>

            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                Auditions Booked
              </label>
              <input
                type="number"
                value={localPipeline.auditionsBooked}
                onChange={(e) => setLocalPipeline({ ...localPipeline, auditionsBooked: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
              <p className="text-xs text-pba-gray mt-1">Auditions successfully booked</p>
            </div>

            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                Auditions Attended
              </label>
              <input
                type="number"
                value={localPipeline.auditionsAttended}
                onChange={(e) => setLocalPipeline({ ...localPipeline, auditionsAttended: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
              <p className="text-xs text-pba-gray mt-1">Auditions that were attended</p>
            </div>

            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                New Enrollments
              </label>
              <input
                type="number"
                value={localPipeline.newEnrollments}
                onChange={(e) => setLocalPipeline({ ...localPipeline, newEnrollments: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
              <p className="text-xs text-pba-gray mt-1">New students enrolled</p>
            </div>
          </div>
        </div>

        {/* Enrollment by Branch */}
        <div>
          <h3 className="text-lg font-jost font-semibold text-gray-800 mb-4">Active Students by Branch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                New Cairo
              </label>
              <input
                type="number"
                value={localEnrollment.newCairo}
                onChange={(e) => setLocalEnrollment({ ...localEnrollment, newCairo: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                Maadi
              </label>
              <input
                type="number"
                value={localEnrollment.maadi}
                onChange={(e) => setLocalEnrollment({ ...localEnrollment, maadi: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
            </div>

            <div>
              <label className="block text-sm font-jost font-semibold text-gray-700 mb-2">
                Sheikh Zayed
              </label>
              <input
                type="number"
                value={localEnrollment.sheikhZayed}
                onChange={(e) => setLocalEnrollment({ ...localEnrollment, sheikhZayed: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pba-burgundy"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-jost">
              <strong>Total:</strong> {localEnrollment.newCairo + localEnrollment.maadi + localEnrollment.sheikhZayed} students
              <br />
              <strong>Target:</strong> 80 students
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-pba-burgundy text-white rounded-lg hover:bg-opacity-90 font-jost font-semibold transition-all"
          >
            <Save size={18} />
            Save All Data
          </button>
        </div>
      </div>
    </div>
  )
}
