import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import RichTextEditor from '../components/RichTextEditor.jsx'

const inputClass = "focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[14px] text-[#f2f0ea] backdrop-blur-xl transition-colors focus:border-[#c9a227]/60 focus:outline-none focus:ring-2 focus:ring-[#c9a227]/10"
const labelClass = "mb-1.5 block text-[13px] font-medium text-[#f2f0ea]"
const helpClass = "mt-1.5 text-[12.5px] text-[#f2f0ea59]"

function Seccion({ titulo, descripcion, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold tracking-tight text-[#f2f0ea]">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-[13px] text-[#f2f0ea73]">{descripcion}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export default function Configuracion() {
  const [config, setConfig] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    supabase.from('config_sitio').select('*').eq('id', 1).single().then(({ data }) => setConfig(data))
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const { id, ...payload } = config
    await supabase.from('config_sitio').update(payload).eq('id', 1)
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  if (!config) return <p className="text-[#f2f0ea73]">Cargando configuración…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-medium tracking-tight text-[#f2f0ea]">Configuración</h1>
        {guardado && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[12.5px] font-medium text-emerald-400">
            Guardado ✓
          </span>
        )}
      </div>

      <form onSubmit={guardar} className="space-y-6">
        <Seccion titulo="Contacto" descripcion="Cómo te contactan los visitantes de la página principal.">
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              value={config.whatsapp_numero || ''} onChange={(e) => setConfig({ ...config, whatsapp_numero: e.target.value })}
              placeholder="56912345678"
              className={inputClass}
            />
            <p className={helpClass}>Con código de país, sin el símbolo +.</p>
          </div>

          <div>
            <label className={labelClass}>Mensaje predeterminado de WhatsApp</label>
            <input
              value={config.whatsapp_mensaje_defecto || ''} onChange={(e) => setConfig({ ...config, whatsapp_mensaje_defecto: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Correo para recibir notificaciones</label>
            <input
              type="email" value={config.correo_notificaciones || ''} onChange={(e) => setConfig({ ...config, correo_notificaciones: e.target.value })}
              placeholder="ingeniero@virtusobras.cl"
              className={inputClass}
            />
          </div>
        </Seccion>

        <Seccion titulo="Página principal" descripcion="El titular y subtítulo que ven los visitantes al entrar.">
          <div>
            <label className={labelClass}>Título principal</label>
            <input
              value={config.hero_titulo || ''} onChange={(e) => setConfig({ ...config, hero_titulo: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Subtítulo</label>
            <textarea
              rows={2} value={config.hero_subtitulo || ''} onChange={(e) => setConfig({ ...config, hero_subtitulo: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
        </Seccion>

        <Seccion titulo="Presupuestos" descripcion="Costos que se aplican a las visitas técnicas.">
          <div>
            <label className={labelClass}>Costo de la visita técnica (CLP)</label>
            <input
              type="number" min="0" value={config.costo_visita || 0} onChange={(e) => setConfig({ ...config, costo_visita: e.target.value })}
              className={inputClass}
            />
            <p className={helpClass}>Se muestra en la página principal. Ponlo en 0 si por ahora la visita es gratuita.</p>
          </div>
        </Seccion>

        <Seccion titulo="Quiénes somos" descripcion="Aparece en la página principal. Déjalo vacío para ocultar la sección.">
          <RichTextEditor
            value={config.quienes_somos_html || ''}
            onChange={(html) => setConfig({ ...config, quienes_somos_html: html })}
            placeholder="Cuenta la historia de la empresa, la experiencia del ingeniero, años en el rubro, etc."
          />
        </Seccion>

        <button
          type="submit"
          disabled={guardando}
          className="focus-ring w-full rounded-full bg-gold-gradient py-3 text-[14px] font-medium text-[#f2f0ea] shadow-[0_4px_14px_rgba(201,162,39,0.3)] transition-opacity disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <p className="mt-6 text-[12.5px] leading-relaxed text-[#f2f0ea59]">
        Para recibir notificaciones push en tu teléfono cuando se acerque una mantención, activa las notificaciones
        del navegador la primera vez que abras el panel en tu celular (se configura vía OneSignal, ver README).
      </p>
    </div>
  )
}
