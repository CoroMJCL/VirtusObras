import { useEffect, useState } from 'react'
import { Mail, MessageSquareText } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatFecha } from '../lib/formatters.js'

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([])

  const cargar = async () => {
    const { data } = await supabase.from('mensajes_contacto').select('*').order('creado_en', { ascending: false })
    setMensajes(data || [])
  }

  useEffect(() => { cargar() }, [])

  const marcarLeido = async (id) => {
    await supabase.from('mensajes_contacto').update({ leido: true }).eq('id', id)
    cargar()
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-light text-[#1a2233]">Mensajes</h1>

      <div className="space-y-3">
        {mensajes.length === 0 && <p className="text-sm text-[#7c8798]">Sin mensajes todavía.</p>}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl border p-5 ${m.leido ? 'border-[#dde3ea] bg-white' : 'border-gold/30 bg-gold/5'}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {m.origen === 'asistente_ia' ? <MessageSquareText size={15} className="text-gold" /> : <Mail size={15} className="text-gold" />}
                <p className="font-medium text-[#1a2233]">{m.nombre}</p>
                {m.servicio_interes && <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-[#7c8798]">{m.servicio_interes}</span>}
              </div>
              <span className="text-xs text-[#7c8798]">{formatFecha(m.creado_en)}</span>
            </div>
            <p className="whitespace-pre-line text-sm text-[#3a4453]">{m.mensaje}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#7c8798]">
              <span>{[m.telefono, m.correo].filter(Boolean).join(' · ')}</span>
              {!m.leido && (
                <button onClick={() => marcarLeido(m.id)} className="focus-ring text-gold hover:underline">
                  Marcar como leído
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
