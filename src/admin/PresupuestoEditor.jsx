import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Download, Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCLP } from '../lib/formatters.js'
import { descargarPresupuestoPDF, obtenerPresupuestoPDFBase64 } from '../lib/pdfPresupuesto.js'
import logoUrl from '../assets/logo-icon.png'

const TIPOS_TRABAJO = ['Gasfitería', 'Mueblería', 'Instalación', 'Reparación', 'Mantención', 'Emergencia']

async function logoComoBase64() {
  const res = await fetch(logoUrl)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

const ITEM_VACIO = () => ({ id: crypto.randomUUID(), descripcion: '', cantidad: 1, precio_unitario: 0 })

export default function PresupuestoEditor() {
  const { id } = useParams()
  const esNuevo = id === 'nuevo'
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [presupuesto, setPresupuesto] = useState({
    cliente_id: '',
    tipo_trabajo: [],
    estado: 'presupuesto',
    descripcion: '',
    excepciones: '',
    items: [ITEM_VACIO()],
    descuento: 0,
    validez_dias: 15,
  })
  const [cliente, setCliente] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, telefono, correo').order('nombre').then(({ data }) => setClientes(data || []))
    if (!esNuevo) {
      supabase.from('presupuestos').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setPresupuesto(data)
      })
    }
  }, [id])

  useEffect(() => {
    if (presupuesto.cliente_id) {
      supabase.from('clientes').select('*').eq('id', presupuesto.cliente_id).single().then(({ data }) => setCliente(data))
    }
  }, [presupuesto.cliente_id])

  const subtotal = useMemo(
    () => presupuesto.items.reduce((s, it) => s + (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0), 0),
    [presupuesto.items]
  )
  const total = subtotal - (Number(presupuesto.descuento) || 0)

  const actualizarItem = (idx, campo, valor) => {
    const items = [...presupuesto.items]
    items[idx] = { ...items[idx], [campo]: valor }
    setPresupuesto({ ...presupuesto, items })
  }

  const agregarItem = () => setPresupuesto({ ...presupuesto, items: [...presupuesto.items, ITEM_VACIO()] })
  const quitarItem = (idx) => setPresupuesto({ ...presupuesto, items: presupuesto.items.filter((_, i) => i !== idx) })

  const toggleTipoTrabajo = (tipo) => {
    const actual = presupuesto.tipo_trabajo || []
    const nuevo = actual.includes(tipo) ? actual.filter((t) => t !== tipo) : [...actual, tipo]
    setPresupuesto({ ...presupuesto, tipo_trabajo: nuevo })
  }

  const guardar = async () => {
    if (!presupuesto.cliente_id) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un cliente antes de guardar.' })
      return
    }
    setGuardando(true)
    const payload = { ...presupuesto, subtotal, total }
    let resultado
    if (esNuevo) {
      delete payload.id
      resultado = await supabase.from('presupuestos').insert([payload]).select().single()
    } else {
      resultado = await supabase.from('presupuestos').update(payload).eq('id', id).select().single()
    }
    setGuardando(false)
    if (resultado.error) {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar. Intenta de nuevo.' })
      return
    }
    setMensaje({ tipo: 'ok', texto: 'Presupuesto guardado.' })
    if (esNuevo) navigate(`/admin/presupuestos/${resultado.data.id}`, { replace: true })
    else setPresupuesto(resultado.data)
  }

  const descargarPDF = async () => {
    const logoDataUrl = `data:image/png;base64,${await logoComoBase64()}`
    descargarPresupuestoPDF({ presupuesto: { ...presupuesto, subtotal, total }, cliente, logoDataUrl })
  }

  const enviarPorCorreo = async () => {
    if (!cliente?.correo) {
      setMensaje({ tipo: 'error', texto: 'Este cliente no tiene un correo registrado.' })
      return
    }
    setEnviandoCorreo(true)
    try {
      const logoDataUrl = `data:image/png;base64,${await logoComoBase64()}`
      const pdfBase64 = obtenerPresupuestoPDFBase64({ presupuesto: { ...presupuesto, subtotal, total }, cliente, logoDataUrl })
      const resp = await fetch('/api/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correoCliente: cliente.correo,
          nombreCliente: cliente.nombre,
          folio: presupuesto.folio,
          total,
          pdfBase64,
        }),
      })
      if (!resp.ok) throw new Error('fallo envio')
      await supabase.from('presupuestos').update({ enviado_por_correo: true, enviado_en: new Date().toISOString() }).eq('id', id)
      setPresupuesto((p) => ({ ...p, enviado_por_correo: true }))
      setMensaje({ tipo: 'ok', texto: `Presupuesto enviado a ${cliente.correo}.` })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo enviar el correo. Verifica la configuración de Resend en Vercel.' })
    } finally {
      setEnviandoCorreo(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate('/admin/presupuestos')} className="focus-ring mb-6 flex items-center gap-2 text-sm text-[#f2f0ea73] hover:text-[#f2f0ea]">
        <ArrowLeft size={16} /> Volver a presupuestos
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-[#f2f0ea]">
          {esNuevo ? 'Nuevo presupuesto' : presupuesto.folio}
        </h1>
        {!esNuevo && (
          <div className="flex gap-2">
            <button onClick={descargarPDF} className="focus-ring flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-[#f2f0eab3] hover:border-gold/50 hover:text-gold">
              <Download size={15} /> PDF
            </button>
            <button onClick={enviarPorCorreo} disabled={enviandoCorreo} className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-sm font-medium text-obsidian disabled:opacity-50">
              <Mail size={15} /> {enviandoCorreo ? 'Enviando…' : presupuesto.enviado_por_correo ? 'Reenviar por correo' : 'Enviar por correo'}
            </button>
          </div>
        )}
      </div>

      {mensaje && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-7">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Cliente</label>
          <select
            value={presupuesto.cliente_id || ''}
            onChange={(e) => setPresupuesto({ ...presupuesto, cliente_id: e.target.value })}
            className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3]"
          >
            <option value="" className="bg-[#141416]">Selecciona un cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#141416]">{c.nombre} {c.telefono ? `· ${c.telefono}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Tipo de trabajo</label>
          <div className="flex flex-wrap gap-2">
            {TIPOS_TRABAJO.map((t) => (
              <button
                key={t} type="button" onClick={() => toggleTipoTrabajo(t)}
                className={`focus-ring rounded-full border px-3.5 py-1.5 text-xs ${
                  presupuesto.tipo_trabajo?.includes(t) ? 'border-gold bg-gold/15 text-gold' : 'border-white/15 text-[#f2f0ea99]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Descripción del trabajo</label>
          <textarea
            rows={3} value={presupuesto.descripcion || ''}
            onChange={(e) => setPresupuesto({ ...presupuesto, descripcion: e.target.value })}
            className="focus-ring w-full resize-none rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[13px] font-medium text-[#f2f0ea]">Ítems</label>
            <button onClick={agregarItem} className="focus-ring flex items-center gap-1 text-xs text-gold hover:underline">
              <Plus size={14} /> Agregar ítem
            </button>
          </div>
          <div className="space-y-2">
            {presupuesto.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input
                  placeholder="Descripción" value={item.descripcion}
                  onChange={(e) => actualizarItem(idx, 'descripcion', e.target.value)}
                  className="focus-ring col-span-6 rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-3 py-2 text-sm text-[#f2f0ea]"
                />
                <input
                  type="number" min="0" placeholder="Cant." value={item.cantidad}
                  onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                  className="focus-ring col-span-2 rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-3 py-2 text-sm text-[#f2f0ea]"
                />
                <input
                  type="number" min="0" placeholder="Precio unit." value={item.precio_unitario}
                  onChange={(e) => actualizarItem(idx, 'precio_unitario', e.target.value)}
                  className="focus-ring col-span-3 rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-3 py-2 text-sm text-[#f2f0ea]"
                />
                <button onClick={() => quitarItem(idx)} className="focus-ring col-span-1 flex items-center justify-center text-[#f2f0ea73] hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Excepciones</label>
          <textarea
            rows={3} value={presupuesto.excepciones || ''}
            onChange={(e) => setPresupuesto({ ...presupuesto, excepciones: e.target.value })}
            placeholder="Ej: Si al abrir el muro se detecta cañería en mal estado, el reemplazo tiene un costo adicional de $XX.XXX no incluido en este presupuesto."
            className="focus-ring w-full resize-none rounded-xl border border-gold/25 bg-gold/[0.04] px-4 py-2.5 text-sm text-[#f2f0ea] placeholder:text-[#f2f0ea4d]"
          />
          <p className="mt-1.5 text-xs text-[#f2f0ea59]">
            Trabajos que no están incluidos en el precio de arriba, pero que se pueden realizar aparte con costo
            adicional. Aparece destacado en el PDF para que el cliente lo vea antes de aceptar.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Fecha de creación</label>
            <input
              type="date"
              value={(presupuesto.creado_en || new Date().toISOString()).slice(0, 10)}
              onChange={(e) => setPresupuesto({ ...presupuesto, creado_en: e.target.value })}
              className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Descuento (CLP)</label>
            <input
              type="number" min="0" value={presupuesto.descuento}
              onChange={(e) => setPresupuesto({ ...presupuesto, descuento: e.target.value })}
              className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Validez (días)</label>
            <input
              type="number" min="1" value={presupuesto.validez_dias}
              onChange={(e) => setPresupuesto({ ...presupuesto, validez_dias: e.target.value })}
              className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#f2f0ea]">Etapa del expediente</label>
          <div className="flex gap-2">
            {['cliente', 'presupuesto', 'servicio', 'cierre'].map((e) => (
              <button
                key={e} type="button" onClick={() => setPresupuesto({ ...presupuesto, estado: e })}
                className={`focus-ring flex-1 rounded-full border py-2 text-xs capitalize ${
                  presupuesto.estado === e ? 'border-gold bg-gold/15 text-gold' : 'border-white/15 text-[#f2f0ea73]'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-5">
          <div className="text-sm text-[#f2f0ea73]">
            Subtotal: {formatCLP(subtotal)} {presupuesto.descuento > 0 && `· Descuento: ${formatCLP(presupuesto.descuento)}`}
          </div>
          <div className="text-xl font-light text-[#f2f0ea]">{formatCLP(total)}</div>
        </div>

        <button onClick={guardar} disabled={guardando} className="focus-ring w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar presupuesto'}
        </button>
      </div>
    </div>
  )
}
