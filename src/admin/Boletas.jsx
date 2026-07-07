import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit3, X, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCLP, formatFecha } from '../lib/formatters.js'

const VACIO = {
  numero_boleta: '', cliente_id: '', detalle: '', fecha: new Date().toISOString().slice(0, 10),
  monto_neto: 0, monto_con_iva: 0, imagen_url: '',
}

export default function Boletas() {
  const [boletas, setBoletas] = useState([])
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('boletas')
      .select('*, clientes(nombre)')
      .order('fecha', { ascending: false })
    setBoletas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    cargar()
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  // Autocalcula el monto con IVA (19%) al escribir el neto, pero se puede sobreescribir manualmente.
  const actualizarNeto = (valor) => {
    const neto = Number(valor) || 0
    setEditando({ ...editando, monto_neto: valor, monto_con_iva: Math.round(neto * 1.19) })
  }

  const subirImagen = async (file) => {
    if (!file) return
    setSubiendo(true)
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('boletas').upload(path, file)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('boletas').getPublicUrl(path)
      setEditando((prev) => ({ ...prev, imagen_url: urlData.publicUrl }))
    }
    setSubiendo(false)
  }

  const guardar = async (e) => {
    e.preventDefault()
    const payload = { ...editando }
    const id = payload.id
    delete payload.id
    delete payload.creado_en
    delete payload.clientes
    if (id) {
      await supabase.from('boletas').update(payload).eq('id', id)
    } else {
      await supabase.from('boletas').insert([payload])
    }
    setEditando(null)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta boleta?')) return
    await supabase.from('boletas').delete().eq('id', id)
    cargar()
  }

  const filtradas = boletas.filter((b) =>
    [b.numero_boleta, b.clientes?.nombre, b.detalle].some((v) => (v || '').toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[26px] font-medium tracking-tight text-bone">Boletas</h1>
        <button
          onClick={() => setEditando({ ...VACIO })}
          className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-obsidian"
        >
          <Plus size={16} /> Nueva boleta
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 backdrop-blur-xl">
        <Search size={16} className="text-bone/40" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por número, cliente o detalle…"
          className="w-full bg-transparent text-sm text-bone placeholder:text-bone/30 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-[11px] font-semibold uppercase tracking-wide text-bone/45 border-b border-white/10">
            <tr>
              <th className="px-5 py-3 font-normal"></th>
              <th className="px-5 py-3 font-normal">N° Boleta</th>
              <th className="px-5 py-3 font-normal">Cliente</th>
              <th className="px-5 py-3 font-normal">Fecha</th>
              <th className="px-5 py-3 font-normal">Neto</th>
              <th className="px-5 py-3 font-normal">Con IVA</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && <tr><td colSpan={7} className="px-5 py-8 text-center text-bone/40">Cargando…</td></tr>}
            {!loading && filtradas.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-bone/40">Sin boletas registradas todavía.</td></tr>
            )}
            {filtradas.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  {b.imagen_url ? (
                    <a href={b.imagen_url} target="_blank" rel="noopener noreferrer">
                      <img src={b.imagen_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10" />
                    </a>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-bone/20">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 font-mono text-gold">{b.numero_boleta}</td>
                <td className="px-5 py-4 text-bone/80">{b.clientes?.nombre || '—'}</td>
                <td className="px-5 py-4 text-bone/50">{formatFecha(b.fecha)}</td>
                <td className="px-5 py-4 text-bone/70">{formatCLP(b.monto_neto)}</td>
                <td className="px-5 py-4 font-medium text-bone">{formatCLP(b.monto_con_iva)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditando(b)} className="focus-ring rounded-lg p-2 text-bone/50 hover:bg-white/5 hover:text-gold">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => eliminar(b.id)} className="focus-ring rounded-lg p-2 text-bone/50 hover:bg-white/5 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form onSubmit={guardar} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#141416]/95 p-7 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-bone">{editando.id ? 'Editar boleta' : 'Nueva boleta'}</h2>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring text-bone/40 hover:text-bone">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required placeholder="N° de boleta" value={editando.numero_boleta}
                onChange={(e) => setEditando({ ...editando, numero_boleta: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone backdrop-blur-xl"
              />
              <select
                value={editando.cliente_id || ''} onChange={(e) => setEditando({ ...editando, cliente_id: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone/80 backdrop-blur-xl"
              >
                <option value="" className="bg-[#141416]">Cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141416]">{c.nombre}</option>
                ))}
              </select>

              <input
                type="date" value={editando.fecha} onChange={(e) => setEditando({ ...editando, fecha: e.target.value })}
                className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone backdrop-blur-xl [color-scheme:dark] sm:col-span-2"
              />

              <textarea
                placeholder="Detalle del trabajo realizado" rows={2} value={editando.detalle || ''}
                onChange={(e) => setEditando({ ...editando, detalle: e.target.value })}
                className="focus-ring resize-none rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone backdrop-blur-xl sm:col-span-2"
              />

              <div>
                <label className="mb-1.5 block text-xs text-bone/40">Monto neto (CLP)</label>
                <input
                  type="number" min="0" value={editando.monto_neto}
                  onChange={(e) => actualizarNeto(e.target.value)}
                  className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone backdrop-blur-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-bone/40">Monto con IVA (CLP)</label>
                <input
                  type="number" min="0" value={editando.monto_con_iva}
                  onChange={(e) => setEditando({ ...editando, monto_con_iva: e.target.value })}
                  className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-bone backdrop-blur-xl"
                />
                <p className="mt-1 text-[11px] text-bone/30">Se calcula solo con 19% IVA, pero puedes ajustarlo.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-bone/40">Imagen de la boleta</label>
                {editando.imagen_url ? (
                  <div className="flex items-center gap-3">
                    <img src={editando.imagen_url} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10" />
                    <a href={editando.imagen_url} target="_blank" rel="noopener noreferrer" className="focus-ring flex items-center gap-1 text-xs text-gold hover:underline">
                      Ver completa <ExternalLink size={12} />
                    </a>
                    <label className="focus-ring cursor-pointer text-xs text-bone/50 hover:text-bone">
                      Cambiar
                      <input type="file" accept="image/*" hidden onChange={(e) => subirImagen(e.target.files?.[0])} />
                    </label>
                  </div>
                ) : (
                  <label className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-bone/40 hover:border-gold/40 hover:text-gold">
                    <ImageIcon size={16} />
                    {subiendo ? 'Subiendo…' : 'Subir foto o escaneo de la boleta'}
                    <input type="file" accept="image/*" hidden disabled={subiendo} onChange={(e) => subirImagen(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>

            <button type="submit" className="focus-ring mt-6 w-full rounded-full bg-gold-gradient py-3 text-sm font-medium text-obsidian">
              Guardar boleta
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
