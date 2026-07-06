import { useEffect, useState } from 'react'
import { Users, FileText, FolderKanban, BellRing } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatCLP } from '../lib/formatters.js'
import DatePickerButton from './DatePickerButton.jsx'

function fechaHoyCapitalizada() {
  const texto = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

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
    { label: 'Facturado (aprobados)', valor: stats ? formatCLP(stats.totalAprobado) : '—', icon: FolderKanban },
    { label: 'Mantenciones próx. 30 días', valor: stats?.proximasMantenciones ?? '—', icon: BellRing },
  ]

  const primerNombre = session?.user?.user_metadata?.nombre?.split(' ')[0]

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-medium tracking-tight text-[#1d1d1f]">
            {saludoSegunHora()}{primerNombre ? `, ${primerNombre}` : ''}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#86868b]">{fechaHoyCapitalizada()}</p>
        </div>
        <DatePickerButton markedDates={fechasMantencion} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TARJETAS.map(({ label, valor, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#e5e5e7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a227]/10">
              <Icon size={16} className="text-[#a8841b]" strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-[26px] font-medium tracking-tight text-[#1d1d1f]">{valor}</p>
            <p className="mt-1 text-[13px] text-[#86868b]">{label}</p>
          </div>
        ))}
      </div>

      {stats?.mensajesNuevos > 0 && (
        <div className="mt-4 rounded-2xl border border-[#c9a227]/25 bg-[#c9a227]/[0.06] px-5 py-4 text-[13.5px] text-[#8a6a16]">
          Tienes {stats.mensajesNuevos} mensaje(s) sin leer en la sección Mensajes.
        </div>
      )}
    </div>
  )
}
