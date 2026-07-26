export type CustomerType = 'tenant' | 'renter' | 'buyer' | 'guest';
export type LifecycleStatus = 'lead' | 'active' | 'inactive' | 'suspended';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';

export interface Customer {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone?: string;
  nationalId?: string;
  avatarUrl?: string | null;

  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  verificationStatus: VerificationStatus;

  currentProperty?: string; // display string for Sprint 1, later PropertySummary
  propertyId?: string; // property reference ID
  currentUnit?: string; // unit/room number
  currentFloor?: string; // floor number

  totalBookings: number;
  totalRentPaid: number; // derived later from payments
  outstandingBalance: number;

  notes?: string;
  tags?: string[];

  lastActivityAt: string; // ISO
  createdAt: string; // ISO
}

export interface CustomerListParams {
  query?: string;
  type?: CustomerType | 'all';
  lifecycle?: LifecycleStatus | 'all';
  paymentStatus?: 'all' | 'paid' | 'overdue';
  propertyId?: string;
  sort?: 'newest' | 'outstanding' | 'name_asc' | 'name_desc' | 'last_active';
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface BookingSummary { id: string; property: string; from: string; to: string; status: string; totalCents: number; }
export interface PaymentSummary { id: string; date: string; amountCents: number; method?: string; type?: 'rent'|'deposit'|'other'; }
export interface ContractSummary { id: string; property: string; propertyId?: string; startDate: string; endDate?: string; status: 'active'|'expired'|'pending'; rentCents?: number; }
export interface PropertySummary { id: string; name: string; unit?: string; address?: string; }

export interface CustomerMetrics {
  totalBookings: number;
  totalRentPaid: number;
  outstandingBalance: number;
  activeContract?: ContractSummary;
  currentProperty?: PropertySummary;
  lastPayment?: PaymentSummary;
}

// Drawer state model for centralized management
export interface CustomerDrawerState {
  isOpen: boolean;
  customerId?: string;
  activeTab: 'overview' | 'bookings' | 'payments' | 'contracts' | 'properties' | 'timeline';
}

// Unified timeline event model (generated from bookings/payments/contracts/status changes)
export interface TimelineEvent {
  id: string;
  type:
    | 'customer_registered'
    | 'booking_created'
    | 'booking_confirmed'
    | 'payment_submitted'
    | 'payment_verified'
    | 'contract_created'
    | 'property_assigned'
    | 'customer_suspended';
  title: string;
  timestamp: string; // ISO
}
