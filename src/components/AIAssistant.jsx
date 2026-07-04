import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

const SALUDO = {
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente de Virtus Obras. Cuéntame qué problema tienes (una llave que gotea, un mueble que necesitas, una puerta que no cierra, o si necesitas una asesoría técnica) y te digo qué servicio contratar.',
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([SALUDO])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadGuardado, setLeadGuardado] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const enviar = async (e) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || loading) return
    const nuevos = [...messages, { role: 'user', content: texto }]
    setMessages(nuevos)
    setInput('')
    setLoading(true)

    try {
      const resp = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevos }),
      })
      const data = await resp.json()
      const respuesta = data?.reply || 'Disculpa, no pude procesar tu consulta. Escríbenos por WhatsApp.'
      setMessages((m) => [...m, { role: 'assistant', content: respuesta }])

      // Guarda el primer intercambio como lead para seguimiento del ingeniero
      if (!leadGuardado) {
        setLeadGuardado(true)
        supabase.from('mensajes_contacto').insert([{
          nombre: 'Visitante (asistente IA)',
          mensaje: `${texto}\n\n— Respuesta IA: ${respuesta}`,
          origen: 'asistente_ia',
        }])
      }
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Hubo un problema de conexión. Intenta de nuevo o escríbenos por WhatsApp.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir asistente virtual"
        className="focus-ring fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-[0_8px_30px_rgba(201,162,39,0.35)] transition-transform hover:scale-110"
      >
        {open ? <X size={22} className="text-obsidian" /> : <MessageCircle size={22} className="text-obsidian" />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal shadow-2xl">
          <div className="border-b border-white/10 bg-graphite px-5 py-4">
            <p className="text-sm font-semibold text-bone">Asistente Virtus</p>
            <p className="text-xs text-bone/50">Te ayudo a elegir el servicio correcto</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gold-gradient text-obsidian'
                      : 'bg-white/[0.06] text-bone/90'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/[0.06] px-4 py-2.5 text-sm text-bone/50">Escribiendo…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={enviar} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta…"
              className="focus-ring flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone placeholder:text-bone/30"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Enviar"
              className="focus-ring flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold-gradient text-obsidian disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
