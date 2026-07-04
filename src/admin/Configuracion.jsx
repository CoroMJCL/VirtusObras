import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function Configuracion() {
  const [config, setConfig] = useState(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    supabase.from('config_sitio').select('*').eq('id', 1).single().then(({ data }) => setConfig(data))
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    const { id, ...payload } = config
    await supabase.from('config_sitio').update(payload).eq('id', 1)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  if (!config) return <p className="text-bone/40">Cargando configuración…</p>

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-light text-bone">Configuración del sitio</h1>

      <form onSubmit={guardar} className="space-y-5 rounded-2xl border border-white/10 bg-charcoal p-7">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-bone/40">WhatsApp (con código de país, sin +)</label>
          <input
            value={config.whatsapp_numero || ''} onChange={(e) => setConfig({ ...config, whatsapp_numero: e.target.value })}
            placeholder="56912345678"
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-bone/40">Mensaje predeterminado de WhatsApp</label>
          <input
            value={config.whatsapp_mensaje_defecto || ''} onChange={(e) => setConfig({ ...config, whatsapp_mensaje_defecto: e.target.value })}
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-bone/40">Título principal (hero)</label>
          <input
            value={config.hero_titulo || ''} onChange={(e) => setConfig({ ...config, hero_titulo: e.target.value })}
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-bone/40">Subtítulo (hero)</label>
          <textarea
            rows={2} value={config.hero_subtitulo || ''} onChange={(e) => setConfig({ ...config, hero_subtitulo: e.target.value })}
            className="focus-ring w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-bone/40">Correo para recibir notificaciones</label>
          <input
            type="email" value={config.correo_notificaciones || ''} onChange={(e) => setConfig({ ...config, correo_notificaciones: e.target.value })}
            placeholder="ingeniero@virtusobras.cl"
            className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-bone"
          />
        </div>

        <button type="submit" className="focus-ring w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian">
          Guardar configuración
        </button>
        {guardado && <p className="text-center text-sm text-emerald-400">Guardado correctamente.</p>}
      </form>

      <p className="mt-5 text-xs leading-relaxed text-bone/35">
        Para recibir notificaciones push en tu teléfono cuando se acerque una mantención, activa las notificaciones
        del navegador la primera vez que abras el panel en tu celular (esto se configura vía OneSignal en el código
        del sitio, ver README).
      </p>
    </div>
  )
}
