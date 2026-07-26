import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { CalendarProperty, BlockReason } from '@/types/calendar'

interface BlockDatesModalProps {
  isOpen: boolean
  onClose: () => void
  properties: CalendarProperty[]
  selectedPropertyId: string
  onBlockDates: (propertyId: string, startDate: string, endDate: string, reason: BlockReason, notes?: string) => Promise<void>
}

export default function BlockDatesModal({ isOpen, onClose, properties, selectedPropertyId, onBlockDates }: BlockDatesModalProps) {
  const [propertyId, setPropertyId] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reason, setReason] = useState<BlockReason>('maintenance')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPropertyId(selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || '')
      setStartDate(format(new Date(), 'yyyy-MM-dd'))
      setEndDate(format(new Date(), 'yyyy-MM-dd'))
      setReason('maintenance')
      setNotes('')
      setError(null)
    }
  }, [isOpen, selectedPropertyId, properties])

  const reasons: { value: BlockReason; label: string }[] = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'owner_stay', label: 'Owner Stay' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'custom', label: 'Custom' }
  ]

  const handleSubmit = async () => {
    if (!propertyId) { setError('Please select a property'); return }
    if (!startDate || !endDate) { setError('Please select start and end dates'); return }
    if (new Date(endDate) < new Date(startDate)) { setError('End date must be after start date'); return }
    setSubmitting(true); setError(null)
    try { await onBlockDates(propertyId, startDate, endDate, reason, notes || undefined); onClose() }
    catch (err: any) { setError(err.message || 'Failed to block dates.') }
    finally { setSubmitting(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Block Dates</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value as BlockReason)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
              {reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Add any notes..." /></div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Blocking...' : 'Block Dates'}
          </button>
        </div>
      </div>
    </div>
  )
}
