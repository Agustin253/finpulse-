import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        trial_start: new Date().toISOString()
      })
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function subscribe() {
    if (!user) return
    await supabase.from('profiles').update({ is_subscribed: true }).eq('id', user.id)
    setProfile((p) => ({ ...p, is_subscribed: true }))
  }

  function isTrialActive() {
    if (!profile) return false
    if (profile.is_subscribed) return true
    if (!profile.trial_start) return false
    const end = new Date(profile.trial_start)
    end.setDate(end.getDate() + 30)
    return new Date() < end
  }

  function trialDaysLeft() {
    if (!profile?.trial_start || profile?.is_subscribed) return 30
    const end = new Date(profile.trial_start)
    end.setDate(end.getDate() + 30)
    return Math.max(0, Math.ceil((end - new Date()) / 86400000))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, subscribe, isTrialActive, trialDaysLeft }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
