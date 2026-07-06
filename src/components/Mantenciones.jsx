import { useEffect, useState } from 'react'
import { Plus, BellRing, Send, X, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatFecha } from '../lib/formatters.js'

const VACIO = { cliente_id: '', equipo: '', fecha_instalacion: new Date().toISOString().slice(0, 10), frecuencia_meses: 12 }

export default function Mantenciones() {
  const [lista, setLista] = useState([])
  const [clientes, setClientes] = useState([])
  const [nuevo, setNuevo] = useState(null)
  const [enviando, setEnviando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = async () => {
    const { data } = await supabase
      .from('mantenciones')
      .select('*, clientes(nombre, correo, telefono)')
      .eq('activo', true)
      .order('proxima_fecha')
    setLista(data || [])
  }

  useEffect(() => {
    cargar()
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    await supabase.from('mantenciones').insert([nuevo])
    setNuevo(null)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar esta alerta de mantención?')) return
    await supabase.from('mantenciones').update({ activo: false }).eq('id', id)
    cargar()
  }

  const notificarAhora = async (m) => {
    setEnviando(m.id)
    setMensaje(null)
    try {
      const resp = await fetch('/api/send-maintenance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mantenimientoId: m.id,
          equipo: m.equipo,
          proximaFecha: m.proxima_fecha,
          correoCliente: m.clientes?.correo,
          nombreCliente: m.clientes?.nombre,
        }),
      })
      if (!resp.ok) throw new Error()
      await supabase.from('mantenciones').update({ notificado: true, notificado_en: new Date().toISOString() }).eq('id', m.id)
      setMensaje({ tipo: 'ok', texto: `Alerta enviada para ${m.clientes?.nombre}.` })
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo enviar la alerta. Revisa la configuración de Resend/OneSignal.' })
    } finally {
      setEnviando(null)
    }
  }

  const proximas30 = (fecha) => new Date(fecha) <= new Date(Date.now() + 30 * 86400000)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-[#1d1d1f]">Mantenciones</h1>
        <button onClick={() => setNuevo({ ...VACIO })} className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-obsidian">
          <Plus size={16} /> Nueva alerta
        </button>
      </div>

      <p className="mb-5 text-sm text-[#86868b]">
        Registra equipos instalados (ej: calefont) para que el sistema recuerde avisar al cliente por correo y a ti por push cuando se acerque la fecha de mantención.
      </p>

      {mensaje && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e5e5e7]">
        <table className="w-full text-sm">
          <thead className="bg-white text-left text-[13px] font-medium text-[#1d1d1f]">
            <tr>
              <th className="px-5 py-3 font-normal">Cliente</th>
              <th className="px-5 py-3 font-normal">Equipo</th>
              <th className="px-5 py-3 font-normal">Próxima mantención</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e7]">
            {lista.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-[#86868b]">Sin alertas registradas.</td></tr>}
            {lista.map((m) => (
              <tr key={m.id} className="hover:bg-[#f5f5f7]">
                <td className="px-5 py-4">
                  <p className="font-medium text-[#1d1d1f]">{m.clientes?.nombre}</p>
                  <p className="text-xs text-[#86868b]">{m.clientes?.correo}</p>
                </td>
                <td className="px-5 py-4 text-[#4a4a4f]">{m.equipo}</td>
                <td className="px-5 py-4">
                  <span className={proximas30(m.proxima_fecha) ? 'flex items-center gap-1.5 text-gold' : 'text-[#6e6e73]'}>
                    {proximas30(m.proxima_fecha) && <BellRing size={13} />}
                    {formatFecha(m.proxima_fecha)}
                  </span>
                  {m.notificado && <p className="text-xs text-emerald-700">Notificado</p>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => notificarAhora(m)} disabled={enviando === m.id}
                      className="focus-ring flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold hover:text-obsidian disabled:opacity-50"
                    >
                      <Send size={12} /> {enviando === m.id ? 'Enviando…' : 'Notificar'}
                    </button>
                    <button onClick={() => eliminar(m.id)} className="focus-ring rounded-lg p-2 text-[#86868b] hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form onSubmit={guardar} className="w-full max-w-md rounded-2xl border border-[#e5e5e7] bg-white p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg text-[#1d1d1f]">Nueva alerta de mantención</h2>
              <button type="button" onClick={() => setNuevo(null)} className="focus-ring text-[#86868b] hover:text-[#1d1d1f]"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <select required value={nuevo.cliente_id} onChange={(e) => setNuevo({ ...nuevo, cliente_id: e.target.value })}
                className="focus-ring w-full rounded-xl border border-[#d8d8dc] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#4a4a4f]">
                <option value="" className="bg-white">Cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.id} className="bg-white">{c.nombre}</option>)}
              </select>
              <input required placeholder="Equipo (ej: Calefont Junkers 5L)" value={nuevo.equipo}
                onChange={(e) => setNuevo({ ...nuevo, equipo: e.target.value })}
                className="focus-ring w-full rounded-xl border border-[#d8d8dc] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#1d1d1f]" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[#86868b]">Fecha de instalación</label>
                  <input type="date" value={nuevo.fecha_instalacion} onChange={(e) => setNuevo({ ...nuevo, fecha_instalacion: e.target.value })}
                    className="focus-ring w-full rounded-xl border border-[#d8d8dc] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#1d1d1f]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#86868b]">Frecuencia (meses)</label>
                  <input type="number" min="1" value={nuevo.frecuencia_meses} onChange={(e) => setNuevo({ ...nuevo, frecuencia_meses: e.target.value })}
                    className="focus-ring w-full rounded-xl border border-[#d8d8dc] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#1d1d1f]" />
                </div>
              </div>
            </div>
            <button type="submit" className="focus-ring mt-6 w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian">
              Guardar alerta
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
