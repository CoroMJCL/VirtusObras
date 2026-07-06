import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import logo from '../assets/logo-icon.png'
import loginBg from '../assets/admin-login-bg.jpg'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('Correo o contraseña incorrectos.')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0">
        <img src={loginBg} alt="" role="presentation" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="Virtus Obras" className="h-14 w-14 rounded-full" />
          <h1 className="mt-4 font-display text-xl text-bone">Panel administrativo</h1>
          <p className="text-sm text-bone/40">Virtus | Obras</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-charcoal/80 p-7 backdrop-blur-xl shadow-2xl">
          <input
            type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone"
            required autoFocus
          />
          <input
            type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone"
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={loading}
            className="focus-ring w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
