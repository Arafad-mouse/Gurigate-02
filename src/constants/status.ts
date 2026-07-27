// Centralized status constants for GuriGate
// Prevents inconsistency and provides type safety

export const PROPERTY_APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const

export type PropertyApprovalStatus = typeof PROPERTY_APPROVAL_STATUS[keyof typeof PROPERTY_APPROVAL_STATUS]

export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  PENDING: 'pending',
  INACTIVE: 'inactive',
} as const

export type PropertyStatus = typeof PROPERTY_STATUS[keyof typeof PROPERTY_STATUS]

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]

export const DISPUTE_STATUS = {
  NONE: 'none',
  OPEN: 'open',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
} as const

export type DisputeStatus = typeof DISPUTE_STATUS[keyof typeof DISPUTE_STATUS]

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  COMPLETED: 'completed',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

export const USER_ROLE = {
  GUEST: 'guest',
  HOST: 'host',
  MANAGER: 'manager',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE]

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const

export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS]

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SENT: 'sent',
  FAILED: 'failed',
  RETRYING: 'retrying',
  CANCELLED: 'cancelled',
} as const

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS]

export const NOTIFICATION_CHANNEL = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
} as const

export type NotificationChannel = typeof NOTIFICATION_CHANNEL[keyof typeof NOTIFICATION_CHANNEL]

// Conversation types
export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  BOOKING: 'booking',
  PROPERTY: 'property',
  PAYMENT: 'payment',
  SUPPORT: 'support',
  SYSTEM: 'system',
  RMS_CONTRACT: 'rms_contract',
  RMS_TENANT: 'rms_tenant',
  RMS_UNIT: 'rms_unit',
} as const

export type ConversationType = typeof CONVERSATION_TYPE[keyof typeof CONVERSATION_TYPE]

// Conversation status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  CLOSED: 'closed',
} as const

export type ConversationStatus = typeof CONVERSATION_STATUS[keyof typeof CONVERSATION_STATUS]

// Conversation priority
export const CONVERSATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type ConversationPriority = typeof CONVERSATION_PRIORITY[keyof typeof CONVERSATION_PRIORITY]

// Message content types
export const MESSAGE_CONTENT_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  PROPERTY_REFERENCE: 'property_reference',
  BOOKING_REFERENCE: 'booking_reference',
  PAYMENT_REFERENCE: 'payment_reference',
  SYSTEM: 'system',
} as const

export type MessageContentType = typeof MESSAGE_CONTENT_TYPE[keyof typeof MESSAGE_CONTENT_TYPE]

// Status badge colors for UI
export const CUSTOMER_LIFECYCLE_STATUS = {
  LEAD: 'lead',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

export type CustomerLifecycleStatus = typeof CUSTOMER_LIFECYCLE_STATUS[keyof typeof CUSTOMER_LIFECYCLE_STATUS]

export const CUSTOMER_TYPE = {
  TENANT: 'tenant',
  RENTER: 'renter',
  BUYER: 'buyer',
  GUEST: 'guest',
} as const

export type CustomerType = typeof CUSTOMER_TYPE[keyof typeof CUSTOMER_TYPE]

export const STATUS_BADGE_COLORS = {
  PROPERTY: {
    [PROPERTY_APPROVAL_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [PROPERTY_APPROVAL_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PROPERTY_APPROVAL_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [PROPERTY_APPROVAL_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [PROPERTY_APPROVAL_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-800',
  },
  BOOKING: {
    [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [BOOKING_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
    [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
    [BOOKING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  },
  PAYMENT: {
    [PAYMENT_STATUS.PENDING]: 'bg-gray-100 text-gray-800',
    [PAYMENT_STATUS.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
    [PAYMENT_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
    [PAYMENT_STATUS.VERIFIED]: 'bg-green-100 text-green-800',
    [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
    [PAYMENT_STATUS.REFUNDED]: 'bg-orange-100 text-orange-800',
    [PAYMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  },
  VERIFICATION: {
    [VERIFICATION_STATUS.UNVERIFIED]: 'bg-gray-100 text-gray-800',
    [VERIFICATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [VERIFICATION_STATUS.VERIFIED]: 'bg-green-100 text-green-800',
    [VERIFICATION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [VERIFICATION_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-800',
  },
  CUSTOMER_LIFECYCLE: {
    [CUSTOMER_LIFECYCLE_STATUS.LEAD]: 'bg-blue-100 text-blue-800',
    [CUSTOMER_LIFECYCLE_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
    [CUSTOMER_LIFECYCLE_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
    [CUSTOMER_LIFECYCLE_STATUS.SUSPENDED]: 'bg-red-100 text-red-800',
  },
  CUSTOMER_TYPE: {
    [CUSTOMER_TYPE.TENANT]: 'bg-purple-100 text-purple-800',
    [CUSTOMER_TYPE.RENTER]: 'bg-indigo-100 text-indigo-800',
    [CUSTOMER_TYPE.BUYER]: 'bg-teal-100 text-teal-800',
    [CUSTOMER_TYPE.GUEST]: 'bg-orange-100 text-orange-800',
  },
} as const

// Human-readable labels
export const STATUS_LABELS = {
  PROPERTY: {
    [PROPERTY_APPROVAL_STATUS.DRAFT]: 'Draft',
    [PROPERTY_APPROVAL_STATUS.PENDING]: 'Pending Approval',
    [PROPERTY_APPROVAL_STATUS.APPROVED]: 'Approved',
    [PROPERTY_APPROVAL_STATUS.REJECTED]: 'Rejected',
    [PROPERTY_APPROVAL_STATUS.SUSPENDED]: 'Suspended',
  },
  BOOKING: {
    [BOOKING_STATUS.PENDING]: 'Pending',
    [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
    [BOOKING_STATUS.CANCELLED]: 'Cancelled',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
  },
  PAYMENT: {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.SUBMITTED]: 'Submitted',
    [PAYMENT_STATUS.UNDER_REVIEW]: 'Under Review',
    [PAYMENT_STATUS.VERIFIED]: 'Verified',
    [PAYMENT_STATUS.FAILED]: 'Failed',
    [PAYMENT_STATUS.REFUNDED]: 'Refunded',
    [PAYMENT_STATUS.COMPLETED]: 'Completed',
  },
  VERIFICATION: {
    [VERIFICATION_STATUS.UNVERIFIED]: 'Unverified',
    [VERIFICATION_STATUS.PENDING]: 'Pending',
    [VERIFICATION_STATUS.VERIFIED]: 'Verified',
    [VERIFICATION_STATUS.REJECTED]: 'Rejected',
    [VERIFICATION_STATUS.SUSPENDED]: 'Suspended',
  },
  ROLE: {
    [USER_ROLE.GUEST]: 'Guest',
    [USER_ROLE.HOST]: 'Host',
    [USER_ROLE.MANAGER]: 'Manager',
    [USER_ROLE.ADMIN]: 'Admin',
    [USER_ROLE.SUPER_ADMIN]: 'Super Admin',
  },
  CONVERSATION: {
    [CONVERSATION_STATUS.ACTIVE]: 'Active',
    [CONVERSATION_STATUS.ARCHIVED]: 'Archived',
    [CONVERSATION_STATUS.CLOSED]: 'Closed',
  },
  CONVERSATION_PRIORITY: {
    [CONVERSATION_PRIORITY.LOW]: 'Low',
    [CONVERSATION_PRIORITY.NORMAL]: 'Normal',
    [CONVERSATION_PRIORITY.HIGH]: 'High',
    [CONVERSATION_PRIORITY.URGENT]: 'Urgent',
  },
  CUSTOMER_LIFECYCLE: {
    [CUSTOMER_LIFECYCLE_STATUS.LEAD]: 'Lead',
    [CUSTOMER_LIFECYCLE_STATUS.ACTIVE]: 'Active',
    [CUSTOMER_LIFECYCLE_STATUS.INACTIVE]: 'Inactive',
    [CUSTOMER_LIFECYCLE_STATUS.SUSPENDED]: 'Suspended',
  },
  CUSTOMER_TYPE: {
    [CUSTOMER_TYPE.TENANT]: 'Tenant',
    [CUSTOMER_TYPE.RENTER]: 'Renter',
    [CUSTOMER_TYPE.BUYER]: 'Buyer',
    [CUSTOMER_TYPE.GUEST]: 'Guest',
  },
} as const
