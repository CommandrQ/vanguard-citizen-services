import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Vanguard Command Hub</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="w-full p-3 bg-blue-700 hover:bg-blue-600 font-bold rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Hub'}
          </button>
        </form>
      </div>
    </div>
  )
}
