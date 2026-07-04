import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const SERVICIOS = ['Gasfitería', 'Mueblería a medida', 'Puertas y ventanas', 'Asesoría técnica', 'No estoy seguro']

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', servicio_interes: '', mensaje: '' })
  const [estado, setEstado] = useState('idle') // idle | enviando | ok | error

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || (!form.telefono && !form.correo)) {
      setEstado('error')
      return
    }
    setEstado('enviando')
    const { error } = await supabase.from('mensajes_contacto').insert([{ ...form, origen: 'formulario' }])
    setEstado(error ? 'error' : 'ok')
    if (!error) setForm({ nombre: '', telefono: '', correo: '', servicio_interes: '', mensaje: '' })
  }

  return (
    <section id="contacto" className="border-t border-white/5 bg-obsidian py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Contacto</p>
          <h2 className="font-display text-3xl font-light text-bone sm:text-4xl">
            Cuéntanos qué necesitas
          </h2>
          <p className="mt-5 max-w-md text-bone/60">
            Respondemos en menos de 24 horas hábiles. Si es urgente, usa el botón de WhatsApp.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre completo"
              className="focus-ring rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone placeholder:text-bone/30"
              required
            />
            <input
              name="telefono" value={form.telefono} onChange={onChange} placeholder="Teléfono"
              className="focus-ring rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone placeholder:text-bone/30"
            />
          </div>
          <input
            name="correo" value={form.correo} onChange={onChange} type="email" placeholder="Correo electrónico"
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone placeholder:text-bone/30"
          />
          <select
            name="servicio_interes" value={form.servicio_interes} onChange={onChange}
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone/80"
          >
            <option value="" className="bg-obsidian">¿Qué servicio necesitas?</option>
            {SERVICIOS.map((s) => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
          </select>
          <textarea
            name="mensaje" value={form.mensaje} onChange={onChange} placeholder="Cuéntanos brevemente el trabajo" rows={4}
            className="focus-ring w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone placeholder:text-bone/30"
          />

          <button
            type="submit"
            disabled={estado === 'enviando'}
            className="focus-ring w-full rounded-full bg-gold-gradient py-3.5 text-sm font-medium text-obsidian transition-opacity disabled:opacity-50"
          >
            {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
          </button>

          {estado === 'ok' && <p className="text-sm text-emerald-400">Mensaje enviado. Te contactaremos pronto.</p>}
          {estado === 'error' && <p className="text-sm text-red-400">Completa al menos nombre y un medio de contacto.</p>}
        </form>
      </div>
    </section>
  )
}
