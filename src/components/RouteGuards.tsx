import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

function FullPageStatus({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6">
      <div className="max-w-lg rounded-[28px] border border-[#e7ddcf] bg-white p-8 text-center shadow-[0_24px_80px_rgba(79,53,32,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d1633f]">GuriGate</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const location = useLocation()
  const { error, isLoading, session } = useAuth()

  if (isLoading) {
    return <FullPageStatus title="Loading your workspace" message="We’re syncing your session and profile details." />
  }

  if (error) {
    return <FullPageStatus title="Supabase setup required" message={error} />
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return <FullPageStatus title="Checking your session" message="One moment while we load your account state." />
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
