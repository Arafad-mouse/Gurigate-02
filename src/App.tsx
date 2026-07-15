import { Navigate, Route, Routes } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'

import GuriGateNavbar from '@/components/GuriGateNavbar'
import GuriGateFooter from '@/components/GuriGateFooter'
import HomePage from '@/pages/GuriGateLandingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import PropertyPage from '@/pages/PropertyPage'
import PaymentPage from '@/pages/PaymentPage'
import GuriGateDashboard from '@/pages/manage-property/Gurigate dashboard'
import UnitsPage from '@/pages/manage-property/UnitsPage'
import PropertyDetailPage from '@/pages/manage-property/PropertyDetailPage'
import AllPropertiesPage from '@/pages/all-property'
import BookingCustomersPage from '@/pages/bookings/BookingCustomersPage'
import BuildingsPage from '@/pages/admin/BuildingsPage'
import BuildingWorkspace from '@/pages/admin/BuildingWorkspace'
import UnitDetailPage from '@/pages/admin/UnitDetailPage'
// CustomersPage is now rendered inside the Manage Property dashboard, not as an Admin route
import { AuthProvider, AuthContext } from '@/lib/auth-context'
import { AdminLayout } from '@/components/AdminLayout'
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminProperties } from '@/pages/admin/AdminProperties'
import AdminBookings from '@/pages/admin/AdminBookings'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminTransactions from '@/pages/admin/AdminTransactions'
import AdminHosts from '@/pages/admin/AdminHosts'
import AdminGuests from '@/pages/admin/AdminGuests'
import AdminVerifications from '@/pages/admin/AdminVerifications'
import AdminDisputes from '@/pages/admin/AdminDisputes'
import AdminReports from '@/pages/admin/AdminReports'
import AdminNotifications from '@/pages/admin/AdminNotifications'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { GuriGatePropertyService } from '@/services/guriGateProperties'
import type { LandingProperty } from '@/data/landingProperties'
import { AuthGuard } from '@/components/AuthGuard'

// 1. Import your onboarding multi-step form page component here 👇
import BecomeHost from '@/components/host-onboarding/Become-host'

function PropertyPageWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<LandingProperty | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProperty() {
      setIsLoading(true)
      const nextProperty = id ? await GuriGatePropertyService.getPropertyById(id) : null

      if (active) {
        setProperty(nextProperty)
        setIsLoading(false)
      }
    }

    void loadProperty()

    return () => {
      active = false
    }
  }, [id])

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading property...</div>
  }
  
  if (!property) {
    return <Navigate to="/" replace />
  }
  
  return <PropertyPage property={property} onBack={() => navigate('/')} />
}

function PaymentPageWrapper() {
  const navigate = useNavigate()
  
  // Get booking details from sessionStorage
  let bookingDetailsStr: string | null = null
  try {
    bookingDetailsStr = sessionStorage.getItem('bookingDetails')
  } catch {
    // Storage blocked by browser tracking prevention
  }
  if (!bookingDetailsStr) {
    return <Navigate to="/" replace />
  }
  
  const bookingDetails = JSON.parse(bookingDetailsStr)
  
  return (
    <PaymentPage
      booking={bookingDetails}
      onBack={() => navigate(-1)}
      onConfirm={() => {
        // TODO: Show success toast and redirect to bookings
        alert("Booking confirmed! 🎉")
        navigate('/')
      }}
    />
  )
}

function AdminLayoutWrapper() {
  const authContext = useContext(AuthContext)
  return <AdminLayout profile={authContext?.profile || null} />
}

function ManagePropertyWrapper() {
  return <GuriGateDashboard />
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <GuriGateNavbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<ManagePropertyWrapper />} />
            <Route path="/settings/:section" element={<ManagePropertyWrapper />} />
            <Route path="/property/:id" element={<PropertyPageWrapper />} />
            <Route path="/payment" element={
              <AuthGuard>
                <PaymentPageWrapper />
              </AuthGuard>
            } />
            <Route path="/all-property" element={<AllPropertiesPage />} />
            <Route path="/manage-property" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/units" element={<UnitsPage />} />
            <Route path="/manage-property/property/:id" element={<PropertyDetailPage />} />
            <Route path="/manage-property/customers" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/bookings" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/bookings/customers" element={<BookingCustomersPage />} />
            <Route path="/manage-property/buildings" element={<BuildingsPage />} />
            <Route path="/manage-property/buildings/:id" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/units/:id" element={<UnitDetailPage />} />
            <Route path="/manage-property/transactions" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/hosts" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/guests" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/verifications" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/disputes" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/invoices" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/notifications" element={<ManagePropertyWrapper />} />
            <Route path="/manage-property/settings" element={<ManagePropertyWrapper />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayoutWrapper />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/:status" element={<AdminProperties />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* 2. Added Route path to display your onboarding workflow page 👇 */}
            <Route path="/become-a-host" element={
              <AuthGuard>
                <BecomeHost />
              </AuthGuard>
            } />

            {/* Catch-all redirect MUST stay at the very bottom of the Routes list */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <GuriGateFooter />
      </div>
    </AuthProvider>
  )
}

export default App
