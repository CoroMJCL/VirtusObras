import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCLP, formatFecha } from '../lib/formatters.js'

const ESTADO_STYLES = {
  cliente: 'bg-white/10 text-[#6e6e73]',
  presupuesto: 'bg-gold/15 text-gold',
  servicio: 'bg-blue-500/15 text-blue-300',
  cierre: 'bg-emerald-500/15 text-emerald-300',
}

export default function Presupuestos() {
  const [lista, setLista] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('presupuestos')
      .select('*, clientes(nombre, telefono)')
      .order('creado_en', { ascending: false })
      .then(({ data }) => {
        setLista(data || [])
        setLoading(false)
      })
  }, [])

  const filtrados = lista.filter((p) =>
    [p.folio, p.clientes?.nombre].some((v) => (v || '').toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-[#1d1d1f]">Presupuestos</h1>
        <Link
          to="/admin/presupuestos/nuevo"
          className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-obsidian"
        >
          <Plus size={16} /> Nuevo presupuesto
        </Link>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#e5e5e7] bg-[#f5f5f7] px-4 py-2.5">
        <Search size={16} className="text-[#86868b]" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por folio o cliente…"
          className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#a0a0a5] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e5e5e7]">
        <table className="w-full text-sm">
          <thead className="bg-white text-left text-xs uppercase tracking-wide text-[#86868b]">
            <tr>
              <th className="px-5 py-3 font-normal">Folio</th>
              <th className="px-5 py-3 font-normal">Cliente</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              <th className="px-5 py-3 font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e7]">
            {loading && <tr><td colSpan={5} className="px-5 py-8 text-center text-[#86868b]">Cargando…</td></tr>}
            {!loading && filtrados.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#86868b]">Sin presupuestos todavía.</td></tr>
            )}
            {filtrados.map((p) => (
              <tr key={p.id} className="cursor-pointer hover:bg-[#f5f5f7]">
                <td className="px-5 py-4">
                  <Link to={`/admin/presupuestos/${p.id}`} className="font-mono text-gold hover:underline">{p.folio}</Link>
                </td>
                <td className="px-5 py-4 text-[#4a4a4f]">{p.clientes?.nombre || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${ESTADO_STYLES[p.estado] || ''}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#4a4a4f]">{formatCLP(p.total)}</td>
                <td className="px-5 py-4 text-[#86868b]">{formatFecha(p.creado_en)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
