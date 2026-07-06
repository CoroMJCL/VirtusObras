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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm">
      <form onSubmit={guardar} className="w-full max-w-sm rounded-2xl border border-[#e5e5e7] bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="mb-5 flex flex-col items-center text-center">
          <img src={logo} alt="Virtus Obras" className="h-11 w-11 rounded-full" />
          <h2 className="mt-4 text-[15px] font-medium text-[#1d1d1f]">¿Cómo te llamas?</h2>
          <p className="mt-1 text-[13px] text-[#86868b]">Para saludarte por tu nombre en el panel.</p>
        </div>

        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan Carlos"
          className="focus-ring w-full rounded-xl border border-[#d0d0d5] bg-[#f5f5f7] px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder:text-[#a0a0a5]"
        />

        <button
          type="submit"
          disabled={guardando || !nombre.trim()}
          className="focus-ring mt-4 w-full rounded-full bg-gold-gradient py-2.5 text-[13.5px] font-medium text-white disabled:opacity-40"
        >
          {guardando ? 'Guardando…' : 'Continuar'}
        </button>
      </form>
    </div>
  )
}
