import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing login session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for sign-in/out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="loading">Initializing Vanguard Systems...</div>

  return (
    <div className="hub-container">
      {!session ? (
        <AuthGate />
      ) : (
        <AppLibrary user={session.user} />
      )}
    </div>
  )
}

// Internal component for the Login UI
function AuthGate() {
  const handleLogin = async () => {
    // This triggers the Supabase Auth UI or a simple Email/Pass login
    // For now, we use a simple alert to show it's wired up
    alert("System Ready: Connect your Supabase Auth here.")
  }

  return (
    <div className="login-screen">
      <h1>Vanguard Command Hub</h1>
      <button onClick={handleLogin}>Enter Hub</button>
    </div>
  )
}

// Internal component for the App Grid
function AppLibrary({ user }) {
  return (
    <div className="dashboard">
      <h2>Welcome, Citizen</h2>
      <div className="app-grid">
        <div className="app-card">⚖️ Constitution</div>
        <div className="app-card">📝 Mission Logs</div>
      </div>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  )
}

export default App
