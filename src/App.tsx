import { Navigate, Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/GuriGateLandingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/account/integrations" element={<IntegrationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
