export type CustomerType = 'tenant' | 'renter' | 'buyer' | 'guest';
export type LifecycleStatus = 'lead' | 'active' | 'inactive' | 'suspended';

export interface Customer {
  id: string;
  fullName: string;
  email: string | null;
  phone?: string;

  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;

  currentProperty?: string; // display string for Sprint 1, later PropertySummary
  propertyId?: string; // property reference ID

  totalBookings: number;
  totalRentPaid: number; // derived later from payments

  notes?: string;
  tags?: string[];

  lastActivityAt: string; // ISO
  createdAt: string; // ISO
}

export interface BookingSummary { id: string; property: string; from: string; to: string; status: string; totalCents: number; }
export interface PaymentSummary { id: string; date: string; amountCents: number; method?: string; type?: 'rent'|'deposit'|'other'; }
export interface ContractSummary { id: string; property: string; startDate: string; endDate?: string; status: 'active'|'expired'|'pending'; rentCents?: number; }
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
