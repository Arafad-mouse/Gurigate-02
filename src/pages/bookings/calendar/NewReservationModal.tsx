import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { CalendarProperty } from '@/types/calendar'

interface NewReservationModalProps {
  isOpen: boolean
  onClose: () => void
  properties: CalendarProperty[]
  selectedPropertyId: string
  onCreateReservation: (data: ReservationFormData) => Promise<void>
}

export interface ReservationFormData {
  propertyId: string; guestName: string; guestEmail: string; guestPhone: string
  checkIn: string; checkOut: string; totalPrice: number; currency: string
  status: string; paymentStatus: string
}

export default function NewReservationModal({ isOpen, onClose, properties, selectedPropertyId, onCreateReservation }: NewReservationModalProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    propertyId: '', guestName: '', guestEmail: '', guestPhone: '',
    checkIn: format(new Date(), 'yyyy-MM-dd'), checkOut: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    totalPrice: 0, currency: 'USD', status: 'confirmed', paymentStatus: 'pending'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const defaultProp = selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || ''
      const prop = properties.find(p => p.id === defaultProp)
      setFormData({
        propertyId: defaultProp, guestName: '', guestEmail: '', guestPhone: '',
        checkIn: format(new Date(), 'yyyy-MM-dd'), checkOut: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
        totalPrice: prop?.base_price || 0, currency: prop?.currency || 'USD', status: 'confirmed', paymentStatus: 'pending'
      })
      setError(null)
    }
  }, [isOpen, selectedPropertyId, properties])

  const handleChange = (field: keyof ReservationFormData, value: any) => setFormData(prev => ({ ...prev, [field]: value }))
  const handlePropertyChange = (propId: string) => {
    const prop = properties.find(p => p.id === propId)
    setFormData(prev => ({ ...prev, propertyId: propId, totalPrice: prop?.base_price || 0, currency: prop?.currency || 'USD' }))
  }

  const handleSubmit = async () => {
    if (!formData.propertyId) { setError('Please select a property'); return }
    if (!formData.guestName.trim()) { setError('Guest name is required'); return }
    if (!formData.guestEmail.trim()) { setError('Guest email is required'); return }
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) { setError('Check-out must be after check-in'); return }
    setSubmitting(true); setError(null)
    try { await onCreateReservation(formData); onClose() }
    catch (err: any) { setError(err.message || 'Failed to create reservation') }
    finally { setSubmitting(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Reservation</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select value={formData.propertyId} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input type="text" value={formData.guestName} onChange={(e) => handleChange('guestName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Email</label>
              <input type="email" value={formData.guestEmail} onChange={(e) => handleChange('guestEmail', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="john@example.com" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Phone (optional)</label>
            <input type="tel" value={formData.guestPhone} onChange={(e) => handleChange('guestPhone', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="+1234567890" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input type="date" value={formData.checkIn} onChange={(e) => handleChange('checkIn', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input type="date" value={formData.checkOut} onChange={(e) => handleChange('checkOut', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
              <input type="number" value={formData.totalPrice} onChange={(e) => handleChange('totalPrice', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="SOS">SOS</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
              <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="confirmed">Confirmed</option><option value="pending">Pending</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select value={formData.paymentStatus} onChange={(e) => handleChange('paymentStatus', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option>
              </select></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Creating...' : 'Create Reservation'}
          </button>
        </div>
      </div>
    </div>
  )
}
