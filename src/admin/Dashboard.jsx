import { useEffect, useState } from 'react'
import { Users, FileText, FolderKanban, BellRing } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatCLP } from '../lib/formatters.js'
import MiniCalendar from './MiniCalendar.jsx'

const FECHA_HOY = new Date().toLocaleDateString('es-CL', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

function saludoSegunHora() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Dashboard() {
  const { session } = useAuth()
  const [stats, setStats] = useState(null)
  const [fechasMantencion, setFechasMantencion] = useState([])

  useEffect(() => {
    const cargar = async () => {
      const [clientes, presupuestos, mantenciones, mensajes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('presupuestos').select('id, estado, total, aprobado'),
        supabase.from('mantenciones').select('id, proxima_fecha, notificado').eq('activo', true),
        supabase.from('mensajes_contacto').select('id', { count: 'exact', head: true }).eq('leido', false),
      ])

      const totalAprobado = (presupuestos.data || [])
        .filter((p) => p.aprobado)
        .reduce((sum, p) => sum + Number(p.total || 0), 0)

      const proximasMantenciones = (mantenciones.data || []).filter(
        (m) => !m.notificado && new Date(m.proxima_fecha) <= new Date(Date.now() + 30 * 86400000)
      ).length

      setStats({
        clientes: clientes.count || 0,
        presupuestos: presupuestos.data?.length || 0,
        totalAprobado,
        proximasMantenciones,
        mensajesNuevos: mensajes.count || 0,
      })

      setFechasMantencion((mantenciones.data || []).map((m) => m.proxima_fecha))
    }
    cargar()
  }, [])

  const TARJETAS = [
    { label: 'Clientes registrados', valor: stats?.clientes ?? '—', icon: Users },
    { label: 'Presupuestos emitidos', valor: stats?.presupuestos ?? '—', icon: FileText },
    { label: 'Facturado (aprobados)', valor: stats ? formatCLP(stats.totalAprobado) : '—', icon: FileText },
    { label: 'Mantenciones próx. 30 días', valor: stats?.proximasMantenciones ?? '—', icon: BellRing },
  ]

  const nombre = session?.user?.email?.split('@')[0] || 'de nuevo'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-light capitalize text-bone">
          {saludoSegunHora()}, {nombre}
        </h1>
        <p className="mt-1 text-sm capitalize text-bone/45">{FECHA_HOY}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          {TARJETAS.map(({ label, valor, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-charcoal/80 p-6 backdrop-blur-xl">
              <Icon size={20} className="text-gold" strokeWidth={1.5} />
              <p className="mt-4 text-2xl font-light text-bone">{valor}</p>
              <p className="mt-1 text-sm text-bone/45">{label}</p>
            </div>
          ))}

          {stats?.mensajesNuevos > 0 && (
            <div className="rounded-xl border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-gold sm:col-span-2">
              Tienes {stats.mensajesNuevos} mensaje(s) sin leer en la sección Mensajes.
            </div>
          )}
        </div>

        <div>
          <MiniCalendar markedDates={fechasMantencion} />
          <p className="mt-2 text-center text-xs text-bone/30">
            Los puntos dorados marcan mantenciones programadas.
          </p>
        </div>
      </div>
    </div>
  )
}
