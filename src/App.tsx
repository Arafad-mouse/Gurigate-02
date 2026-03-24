import { Navigate, Route, Routes } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'

import HomePage from '@/pages/GuriGateLandingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import PropertyPage from '@/pages/PropertyPage'
import PaymentPage from '@/pages/PaymentPage'
import GuriGateDashboard from '@/pages/Property management/Gurigate dashboard'

// Mock property data - in real app this would come from API
const mockProperties = [
  {
    id: 1,
    title: "Stunning Studio in Kilimani",
    type: "Studio",
    location: "Kilimani, Nairobi",
    city: "Nairobi",
    price: "$120",
    priceUnit: "night",
    rating: 4.95,
    reviews: 128,
    beds: 1,
    baths: 1,
    guests: 2,
    image: "https://images.unsplash.com/photo-1560185127-6a12f9a26fe5?w=800&q=80"
  }
]

function PropertyPageWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  const property = mockProperties.find(p => p.id === parseInt(id || '1'))
  
  if (!property) {
    return <Navigate to="/" replace />
  }
  
  return <PropertyPage property={property} onBack={() => navigate('/')} />
}

function PaymentPageWrapper() {
  const navigate = useNavigate()
  
  // Get booking details from sessionStorage
  const bookingDetailsStr = sessionStorage.getItem('bookingDetails')
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/account/integrations" element={<IntegrationsPage />} />
      <Route path="/property/:id" element={<PropertyPageWrapper />} />
      <Route path="/payment" element={<PaymentPageWrapper />} />
      <Route path="/manage-property" element={<GuriGateDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
