import { useState, useEffect } from 'react'
import { X, Building2, MapPin, DollarSign, Star, Clock, Shield, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '../table/StatusBadge'
import { ApprovalBadge } from '../table/ApprovalBadge'
import { usePropertyModeration } from '@/hooks/usePropertyModeration'
import { usePermissions } from '@/hooks/usePermissions'
import { PROPERTY_APPROVAL_STATUS } from '@/constants/status'
import type { AdminProperty } from '@/services/adminService'
import { CategoryDetailSection } from '@/components/property/CategoryDetailSection'
import type { LandingProperty } from '@/data/landingProperties'

interface PropertyReviewDrawerProps {
  property: AdminProperty | null
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function PropertyReviewDrawer({ property, isOpen, onClose, onRefresh }: PropertyReviewDrawerProps) {
  const { approveProperty, rejectProperty, suspendProperty, featureProperty, unfeatureProperty, getModerationHistory, loading, error, clearError } = usePropertyModeration()
  const { canApproveProperty, canRejectProperty, canSuspendProperty, canFeatureProperty } = usePermissions()
  
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'reviews' | 'history'>('details')
  const [moderationHistory, setModerationHistory] = useState<any[]>([])
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [reason, setReason] = useState('')

  // Convert AdminProperty to LandingProperty for CategoryDetailSection
  const convertToLandingProperty = (prop: AdminProperty): LandingProperty => ({
    id: prop.id,
    title: prop.title,
    address: `${prop.city}`,
    price: `$${prop.price}`,
    priceUnit: prop.currency,
    beds: 0,
    baths: 0,
    sqft: 0,
    badge: prop.approval_status === 'approved' ? 'FOR SALE' : 'FOR RENT',
    featured: prop.is_featured,
    image: prop.images?.[0] || '',
    images: prop.images,
    rating: 0,
    location: prop.city,
    type: prop.type,
    city: prop.city,
    reviews: 0,
    guests: 0,
    category: prop.property_category,
    categoryDetails: prop.property_category === 'residential' 
      ? prop.property_residential_details 
      : prop.property_category === 'commercial'
        ? prop.property_commercial_details
        : prop.property_category === 'land'
          ? prop.property_land_details
          : prop.property_category === 'hospitality'
            ? prop.property_hospitality_details
            : undefined,
  })

  useEffect(() => {
    if (isOpen && property) {
      loadModerationHistory()
    }
  }, [isOpen, property])

  const loadModerationHistory = async () => {
    if (property) {
      const history = await getModerationHistory(property.id)
      setModerationHistory(history)
    }
  }

  const handleApprove = async () => {
    if (!property) return
    const success = await approveProperty(property.id)
    if (success) {
      onRefresh()
      loadModerationHistory()
    }
  }

  const handleReject = async () => {
    if (!property || !reason.trim()) return
    const success = await rejectProperty(property.id, reason)
    if (success) {
      setShowRejectModal(false)
      setReason('')
      onRefresh()
      loadModerationHistory()
    }
  }

  const handleSuspend = async () => {
    if (!property || !reason.trim()) return
    const success = await suspendProperty(property.id, reason)
    if (success) {
      setShowSuspendModal(false)
      setReason('')
      onRefresh()
      loadModerationHistory()
    }
  }

  const handleFeature = async () => {
    if (!property) return
    const success = await featureProperty(property.id)
    if (success) {
      onRefresh()
      loadModerationHistory()
    }
  }

  const handleUnfeature = async () => {
    if (!property) return
    const success = await unfeatureProperty(property.id)
    if (success) {
      onRefresh()
      loadModerationHistory()
    }
  }

  if (!isOpen || !property) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                {property.is_featured && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Featured</span>
                )}
                {property.property_category && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                    {property.property_category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{property.city}</span>
                <span>•</span>
                <span>{property.type}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close drawer">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mt-3">
            <ApprovalBadge status={property.approval_status} />
            <StatusBadge status={property.status} category="PROPERTY" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {(['details', 'images', 'reviews', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
              <button onClick={clearError} className="ml-2 text-red-700 underline">Dismiss</button>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Owner Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">{property.owner_name}</p>
                  <p className="text-gray-500">{property.owner_email}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </h4>
                <div className="text-2xl font-bold text-gray-900">
                  ${property.price} <span className="text-sm font-normal text-gray-500">{property.currency}</span>
                </div>
              </div>

              {/* Property Type */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Property Type
                </h4>
                <p className="text-sm text-gray-700 capitalize">{property.type}</p>
              </div>

              {/* Category-Specific Details */}
              {property.property_category && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Category Details
                  </h4>
                  <CategoryDetailSection 
                    property={convertToLandingProperty(property)}
                  />
                </div>
              )}

              {/* Rejection Reason */}
              {property.rejection_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700">{property.rejection_reason}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Created: {new Date(property.created_at).toLocaleString()}</p>
                {property.approved_at && (
                  <p>Approved: {new Date(property.approved_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {property.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No images uploaded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Reviews coming soon</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {moderationHistory.length > 0 ? (
                <div className="space-y-3">
                  {moderationHistory.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {log.action_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{log.admin_name}</p>
                      {log.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <p key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No moderation history</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 space-y-3">
          {property.approval_status === PROPERTY_APPROVAL_STATUS.PENDING && (
            <div className="flex gap-2">
              {canApproveProperty() && (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Approve
                </button>
              )}
              {canRejectProperty() && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              )}
            </div>
          )}

          {property.approval_status === PROPERTY_APPROVAL_STATUS.APPROVED && (
            <div className="flex gap-2">
              {canSuspendProperty() && (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Suspend
                </button>
              )}
              {canFeatureProperty() && (
                <>
                  {property.is_featured ? (
                    <button
                      onClick={handleUnfeature}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unfeature
                    </button>
                  ) : (
                    <button
                      onClick={handleFeature}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Feature
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {property.approval_status === PROPERTY_APPROVAL_STATUS.SUSPENDED && canApproveProperty() && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Reactivate
            </button>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Property</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[100px]"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!reason.trim() || loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend Modal */}
        {showSuspendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Suspend Property</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter suspension reason..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[100px]"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSuspendModal(false)
                    setReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={!reason.trim() || loading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
