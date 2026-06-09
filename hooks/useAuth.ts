'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const { user, session, profile, loading, error, setUser, setSession, setProfile, setLoading, setError, reset } = useAuthStore()

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    if (error) console.error('Error fetching profile:', error)
  }, [supabase, setProfile])

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }
    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setSession, setUser, setProfile, setLoading, fetchProfile])

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return { error }
    }
    router.push('/dashboard')
    return { error: null }
  }

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, displayName: string, referralCode?: string) => {
    setLoading(true)
    setError(null)

    // Validate referral code if provided
    if (referralCode) {
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('id, current_uses, max_uses, is_active, expires_at')
        .eq('code', referralCode.toUpperCase())
        .single()

      if (codeError || !codeData) {
        setError('Invalid referral code')
        setLoading(false)
        return { error: 'Invalid referral code' }
      }

      if (!codeData.is_active) {
        setError('This referral code is no longer active')
        setLoading(false)
        return { error: 'Referral code inactive' }
      }

      if (codeData.max_uses > 0 && codeData.current_uses >= codeData.max_uses) {
        setError('This referral code has reached its maximum uses')
        setLoading(false)
        return { error: 'Referral code limit reached' }
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        setError('This referral code has expired')
        setLoading(false)
        return { error: 'Referral code expired' }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return { error }
    }

    // If referral code was provided, record the use after profile is created
    if (referralCode && data.user) {
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', referralCode.toUpperCase())
        .single()

      if (codeData) {
        await supabase.from('referral_uses').insert({
          code_id: codeData.id,
          used_by: data.user.id,
        })
        await supabase.rpc('increment_referral_uses', { code_id: codeData.id })
      }
    }

    setLoading(false)
    return { error: null, needsConfirmation: !data.session }
  }

  // Google OAuth
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      toast.error('Failed to sign in with Google')
      setError(error.message)
    }
  }

  // Apple OAuth
  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      toast.error('Failed to sign in with Apple')
      setError(error.message)
    }
  }

  // Password Reset
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?type=recovery`,
    })
    if (error) {
      setError(error.message)
      return { error }
    }
    return { error: null }
  }

  // Update Password
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
      return { error }
    }
    toast.success('Password updated successfully')
    return { error: null }
  }

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut()
    reset()
    router.push('/')
    toast.success('Signed out successfully')
  }

  // Update Profile
  const updateProfile = async (updates: {
    display_name?: string
    avatar_url?: string
    account_balance?: number
    risk_percentage?: number
  }) => {
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      setProfile(data)
      toast.success('Profile updated')
    }
    if (error) toast.error('Failed to update profile')
    return { data, error }
  }

  // Validate Referral Code (real-time check during signup)
  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 4) return { valid: false, message: '' }
    const { data, error } = await supabase
      .from('referral_codes')
      .select('id, is_active, current_uses, max_uses, expires_at')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !data) return { valid: false, message: 'Invalid referral code' }
    if (!data.is_active) return { valid: false, message: 'Referral code is no longer active' }
    if (data.max_uses > 0 && data.current_uses >= data.max_uses) return { valid: false, message: 'Referral code has reached its limit' }
    if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, message: 'Referral code has expired' }
    return { valid: true, message: 'Valid referral code!' }
  }

  return {
    user,
    session,
    profile,
    loading,
    error,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager' || profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updatePassword,
    updateProfile,
    validateReferralCode,
  }
}
