import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

type AuthCardProps = {
  title: string
  description: string
  footerLabel: string
  footerHref: string
  footerText: string
  children: ReactNode
}

function AuthCard({
  title,
  description,
  footerLabel,
  footerHref,
  footerText,
  children,
}: AuthCardProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ee] px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,69,60,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(24,31,53,0.16),_transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#eadfcf] bg-white/95 shadow-[0_24px_90px_rgba(33,20,13,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden flex-col justify-between bg-[#1f1720] p-10 text-white lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f2a587]">GuriGate</p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight">A sharper way to discover and manage property.</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              Search, shortlist, and move from inquiry to signed decision with a workspace built for modern property teams.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">Live inventory</p>
              <p className="mt-2 text-3xl font-semibold">12,400+</p>
              <p className="mt-2 text-sm text-white/60">Listings indexed across trusted neighborhoods and verified partners.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">Fast onboarding</p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Connect your account once, then manage saved properties, preferences, and updates from one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d1633f] lg:hidden">GuriGate</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </div>

            {children}

            <p className="mt-6 text-sm text-slate-600">
              {footerText}{' '}
              <Link className="font-semibold text-[#d45734] transition hover:text-[#b63d1e]" to={footerHref}>
                {footerLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthCard
