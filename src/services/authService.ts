import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabase } from '@/lib/supabase'

type ProfileRecord = {
  first_name: string | null
  last_name: string | null
  full_name?: string | null
  avatar_url?: string | null
  role?: string | null
}

export type AuthProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl: string | null
  roleLabel: string
  initials: string
  createdAt: string
  role?: string
  isBanned?: boolean
}

export const isAdmin = (profile: AuthProfile | null): boolean => {
  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

export const isManager = (profile: AuthProfile | null): boolean => {
  return profile?.role === 'manager' || isAdmin(profile)
}

export const isHost = (profile: AuthProfile | null): boolean => {
  return profile?.role === 'host' || isManager(profile)
}

export const isVerifiedHost = (profile: AuthProfile | null): boolean => {
  return isHost(profile) && !profile?.isBanned
}

export const isBanned = (profile: AuthProfile | null): boolean => {
  return profile?.isBanned ?? false
}

export type SignUpProfileInput = {
  firstName: string
  lastName: string
  roleLabel?: string
}

export type UpdateProfileInput = {
  firstName: string
  lastName: string
  email: string
  roleLabel?: string
  currentAvatarUrl?: string | null
  avatarFile?: File | null
}

const supabaseConfigurationError =
  'Supabase is not configured. Replace VITE_SUPABASE_ANON_KEY in frontend/.env with your real anon key.'

function getValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatFullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ').trim()
}

function getInitials(firstName: string, lastName: string, email: string) {
  const source = [firstName, lastName].filter(Boolean)

  if (source.length > 0) {
    return source.map((part) => part[0]?.toUpperCase() ?? '').join('').slice(0, 2)
  }

  return email.slice(0, 2).toUpperCase()
}

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigurationError)
  }
}

function buildProfile(user: User, profileRecord?: ProfileRecord | null): AuthProfile {
  const metadata = user.user_metadata ?? {}
  const email = user.email ?? ''
  const firstName = getValue(profileRecord?.first_name) || getValue(metadata.first_name)
  const lastName = getValue(profileRecord?.last_name) || getValue(metadata.last_name)
  const fullName =
    getValue(profileRecord?.full_name) ||
    getValue(metadata.full_name) ||
    formatFullName(firstName, lastName) ||
    email.split('@')[0]
  const roleLabel = getValue(profileRecord?.role) || getValue(metadata.role) || 'Member'
  const avatarUrl = getValue(profileRecord?.avatar_url) || getValue(metadata.avatar_url) || null

  return {
    id: user.id,
    email,
    firstName,
    lastName,
    fullName,
    avatarUrl,
    roleLabel,
    initials: getInitials(firstName, lastName, email),
    createdAt: user.created_at,
  }
}

async function readProfileRecord(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      return null
    }

    return data
  } catch {
    return null
  }
}

async function persistProfileRecord(userId: string, profile: Omit<AuthProfile, 'id' | 'initials' | 'createdAt'>) {
  try {
    await supabase.from('profiles').upsert(
      {
        id: userId,
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        role: profile.roleLabel,
      },
      { onConflict: 'id' },
    )
  } catch {
    return
  }
}

async function uploadAvatar(userId: string, file: File) {
  const extension = file.name.split('.').pop() || 'png'
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
    upsert: true,
    cacheControl: '3600',
  })

  if (error) {
    throw new Error("Avatar upload failed. Create an 'avatars' storage bucket or update the bucket name in authService.ts.")
  }

  return supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl
}

export function getSupabaseConfigurationError() {
  return isSupabaseConfigured ? null : supabaseConfigurationError
}

export async function getCurrentSession() {
  assertSupabaseConfigured()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export function subscribeToAuthChanges(listener: (event: AuthChangeEvent, session: Session | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(listener)

  return subscription
}

export async function hydrateProfile(user: User | null) {
  if (!user) {
    return null
  }

  const profileRecord = await readProfileRecord(user.id)
  return buildProfile(user, profileRecord)
}

export async function signInWithEmail(email: string, password: string) {
  assertSupabaseConfigured()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithEmail(email: string, password: string, profileInput: SignUpProfileInput) {
  assertSupabaseConfigured()

  const firstName = profileInput.firstName.trim()
  const lastName = profileInput.lastName.trim()
  const roleLabel = profileInput.roleLabel?.trim() || 'Member'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: formatFullName(firstName, lastName),
        role: roleLabel,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(input: UpdateProfileInput) {
  assertSupabaseConfigured()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error('No authenticated user found.')
  }

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const fullName = formatFullName(firstName, lastName)
  const email = input.email.trim()
  const roleLabel = input.roleLabel?.trim() || getValue(user.user_metadata.role) || 'Member'

  let avatarUrl = input.currentAvatarUrl ?? (getValue(user.user_metadata.avatar_url) || null)

  if (input.avatarFile) {
    avatarUrl = await uploadAvatar(user.id, input.avatarFile)
  }

  const { data, error } = await supabase.auth.updateUser({
    email: email === user.email ? undefined : email,
    data: {
      ...user.user_metadata,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: roleLabel,
    },
  })

  if (error) {
    throw error
  }

  const nextUser = data.user ?? user
  const nextProfile = buildProfile(nextUser)

  await persistProfileRecord(nextUser.id, {
    email: nextProfile.email,
    firstName: nextProfile.firstName,
    lastName: nextProfile.lastName,
    fullName: nextProfile.fullName,
    avatarUrl: nextProfile.avatarUrl,
    roleLabel: nextProfile.roleLabel,
  })

  return hydrateProfile(nextUser)
}

export async function updatePassword(nextPassword: string) {
  assertSupabaseConfigured()

  const { error } = await supabase.auth.updateUser({
    password: nextPassword,
  })

  if (error) {
    throw error
  }
}

export async function signOutUser() {
  assertSupabaseConfigured()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
