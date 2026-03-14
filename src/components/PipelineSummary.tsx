import { WhatsAppPipeline } from '../types'
import { MessageCircle, CheckCircle, Users } from 'lucide-react'

interface PipelineSummaryProps {
  pipeline: WhatsAppPipeline
}

export default function PipelineSummary({ pipeline }: PipelineSummaryProps) {
  const bookingRate = pipeline.inquiriesThisWeek > 0 
    ? ((pipeline.auditionsBooked / pipeline.inquiriesThisWeek) * 100).toFixed(1)
    : '0'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-cormorant font-bold text-gray-800 mb-4">WhatsApp Pipeline</h3>
      
      <div className="space-y-3">
        {/* Inquiries */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <MessageCircle size={20} className="text-blue-600" />
          <div>
            <p className="text-xs text-blue-600 font-jost">Inquiries this week</p>
            <p className="text-2xl font-cormorant font-bold text-blue-700">{pipeline.inquiriesThisWeek}</p>
          </div>
        </div>

        {/* Auditions Booked */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-green-600 font-jost">Auditions booked</p>
            <p className="text-2xl font-cormorant font-bold text-green-700">{pipeline.auditionsBooked}</p>
          </div>
        </div>

        {/* New Enrollments */}
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <Users size={20} className="text-purple-600" />
          <div>
            <p className="text-xs text-purple-600 font-jost">New enrollments</p>
            <p className="text-2xl font-cormorant font-bold text-purple-700">{pipeline.newEnrollments}</p>
          </div>
        </div>

        {/* Booking Rate */}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs text-amber-600 font-jost mb-1">Booking Rate</p>
          <p className="text-lg font-cormorant font-bold text-amber-700">
            {bookingRate}%
            <span className="text-xs text-amber-600 ml-2">Target: 25%+</span>
          </p>
        </div>
      </div>
    </div>
  )
}
