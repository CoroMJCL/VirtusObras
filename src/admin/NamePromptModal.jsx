import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import logo from '../assets/logo-icon.png'

export default function NamePromptModal({ onSaved }) {
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    const { data, error } = await supabase.auth.updateUser({ data: { nombre: nombre.trim() } })
    setGuardando(false)
    if (!error) onSaved(data.user)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
      <form onSubmit={guardar} className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#141416] p-7">
        <div className="mb-5 flex flex-col items-center text-center">
          <img src={logo} alt="Virtus Obras" className="h-11 w-11 rounded-full" />
          <h2 className="mt-4 text-[15px] font-medium text-bone">¿Cómo te llamas?</h2>
          <p className="mt-1 text-[13px] text-bone/40">Para saludarte por tu nombre en el panel.</p>
        </div>

        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan Carlos"
          className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[14px] text-bone placeholder:text-bone/25"
        />

        <button
          type="submit"
          disabled={guardando || !nombre.trim()}
          className="focus-ring mt-4 w-full rounded-full bg-gold-gradient py-2.5 text-[13.5px] font-medium text-[#0c0c0e] disabled:opacity-40"
        >
          {guardando ? 'Guardando…' : 'Continuar'}
        </button>
      </form>
    </div>
  )
}
