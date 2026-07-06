import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit3, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { REGIONES_CHILE, comunasDeRegion, regionDeComuna } from '../lib/chileRegiones.js'
import AddressField from '../components/AddressField.jsx'

const VACIO = { nombre: '', rut: '', telefono: '', correo: '', direccion: '', region: '', comuna: '', contacto_preferido: 'whatsapp', notas: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, {...} = editar
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('clientes').select('*').order('creado_en', { ascending: false })
    setClientes(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    const payload = { ...editando }
    const id = payload.id
    delete payload.id
    delete payload.creado_en
    if (id) {
      await supabase.from('clientes').update(payload).eq('id', id)
    } else {
      await supabase.from('clientes').insert([payload])
    }
    setEditando(null)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente y sus presupuestos asociados?')) return
    await supabase.from('clientes').delete().eq('id', id)
    cargar()
  }

  const filtrados = clientes.filter((c) =>
    [c.nombre, c.rut, c.telefono, c.correo].some((v) => (v || '').toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-[#f2f0ea]">Clientes</h1>
        <button
          onClick={() => setEditando({ ...VACIO })}
          className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-obsidian"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5">
        <Search size={16} className="text-[#f2f0ea73]" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, RUT, teléfono o correo…"
          className="w-full bg-transparent text-sm text-[#f2f0ea] placeholder:text-[#f2f0ea59] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-[11px] font-semibold uppercase tracking-wide text-[#f2f0ea73] border-b border-white/10">
            <tr>
              <th className="px-5 py-3 font-normal">Nombre</th>
              <th className="px-5 py-3 font-normal">Contacto</th>
              <th className="px-5 py-3 font-normal">Dirección</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#f2f0ea73]">Cargando…</td></tr>
            )}
            {!loading && filtrados.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#f2f0ea73]">Sin clientes todavía.</td></tr>
            )}
            {filtrados.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.04]">
                <td className="px-5 py-4">
                  <p className="font-medium text-[#f2f0ea]">{c.nombre}</p>
                  <p className="text-xs text-[#f2f0ea73]">{c.rut}</p>
                </td>
                <td className="px-5 py-4 text-[#f2f0eab3]">
                  <p>{c.telefono}</p>
                  <p className="text-xs text-[#f2f0ea73]">{c.correo}</p>
                </td>
                <td className="px-5 py-4 text-[#f2f0eab3]">{[c.direccion, c.comuna].filter(Boolean).join(', ')}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditando({ ...c, region: c.region || regionDeComuna(c.comuna) })} className="focus-ring rounded-lg p-2 text-[#f2f0ea73] hover:bg-white/5 hover:text-gold">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => eliminar(c.id)} className="focus-ring rounded-lg p-2 text-[#f2f0ea73] hover:bg-white/5 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form onSubmit={guardar} className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg text-[#f2f0ea]">{editando.id ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring text-[#f2f0ea73] hover:text-[#f2f0ea]">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Nombre completo" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea] sm:col-span-2" />
              <input placeholder="RUT" value={editando.rut || ''} onChange={(e) => setEditando({ ...editando, rut: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]" />
              <input placeholder="Teléfono" value={editando.telefono || ''} onChange={(e) => setEditando({ ...editando, telefono: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]" />
              <input placeholder="Correo electrónico" type="email" value={editando.correo || ''} onChange={(e) => setEditando({ ...editando, correo: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea] sm:col-span-2" />
              <div className="sm:col-span-2">
                <AddressField
                  value={editando.direccion || ''}
                  onChange={(v) => setEditando({ ...editando, direccion: v })}
                  placeholder="Dirección del servicio"
                />
              </div>
              <select
                value={editando.region || ''}
                onChange={(e) => setEditando({ ...editando, region: e.target.value, comuna: '' })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3]"
              >
                <option value="" className="bg-white/[0.04]">Región…</option>
                {REGIONES_CHILE.map((r) => (
                  <option key={r.region} value={r.region} className="bg-white/[0.04]">{r.region}</option>
                ))}
              </select>
              <select
                value={editando.comuna || ''}
                onChange={(e) => setEditando({ ...editando, comuna: e.target.value })}
                disabled={!editando.region}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3] disabled:opacity-40"
              >
                <option value="" className="bg-white/[0.04]">Comuna…</option>
                {comunasDeRegion(editando.region).map((c) => (
                  <option key={c} value={c} className="bg-white/[0.04]">{c}</option>
                ))}
              </select>
              <select value={editando.contacto_preferido} onChange={(e) => setEditando({ ...editando, contacto_preferido: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3] sm:col-span-2">
                <option value="llamada" className="bg-white/[0.04]">Contacto preferido: Llamada</option>
                <option value="whatsapp" className="bg-white/[0.04]">Contacto preferido: WhatsApp</option>
                <option value="correo" className="bg-white/[0.04]">Contacto preferido: Correo</option>
              </select>
              <textarea placeholder="Notas internas" rows={2} value={editando.notas || ''} onChange={(e) => setEditando({ ...editando, notas: e.target.value })}
                className="focus-ring resize-none rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea] sm:col-span-2" />
            </div>

            <button type="submit" className="focus-ring mt-6 w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian">
              Guardar cliente
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
