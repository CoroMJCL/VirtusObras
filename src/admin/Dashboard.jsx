import { useEffect, useState } from 'react'
import { Users, FileText, FolderKanban, BellRing } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatCLP } from '../lib/formatters.js'
import DatePickerButton from './DatePickerButton.jsx'
import { BarraMensual, DonaEstados } from './DashboardCharts.jsx'

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const NOMBRES_ESTADO = { cliente: 'Cliente', presupuesto: 'Presupuesto', servicio: 'Servicio', cierre: 'Cierre' }

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

function agruparPorMes(presupuestos) {
  const hoy = new Date()
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    meses.push({ key: `${d.getFullYear()}-${d.getMonth()}`, mes: MESES_CORTOS[d.getMonth()], cantidad: 0 })
  }
  presupuestos.forEach((p) => {
    const d = new Date(p.creado_en)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = meses.find((m) => m.key === key)
    if (bucket) bucket.cantidad += 1
  })
  return meses
}

function agruparPorEstado(presupuestos) {
  const conteo = { cliente: 0, presupuesto: 0, servicio: 0, cierre: 0 }
  presupuestos.forEach((p) => { if (conteo[p.estado] !== undefined) conteo[p.estado] += 1 })
  return Object.entries(conteo)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value, name: NOMBRES_ESTADO[key] }))
}

export default function Dashboard() {
  const { session } = useAuth()
  const [stats, setStats] = useState(null)
  const [fechasMantencion, setFechasMantencion] = useState([])
  const [datosMensuales, setDatosMensuales] = useState([])
  const [datosEstado, setDatosEstado] = useState([])

  useEffect(() => {
    const cargar = async () => {
      const [clientes, presupuestos, mantenciones, mensajes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('presupuestos').select('id, estado, total, aprobado, creado_en'),
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
      setDatosMensuales(agruparPorMes(presupuestos.data || []))
      setDatosEstado(agruparPorEstado(presupuestos.data || []))
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
          <h1 className="text-[26px] font-medium tracking-tight text-bone">
            {saludoSegunHora()}{primerNombre ? `, ${primerNombre}` : ''}
          </h1>
          <p className="mt-1 text-[13.5px] text-bone/40">{fechaHoyCapitalizada()}</p>
        </div>
        <DatePickerButton markedDates={fechasMantencion} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TARJETAS.map(({ label, valor, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-colors hover:border-white/[0.18]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <Icon size={16} className="text-gold" strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-[26px] font-medium tracking-tight text-bone">{valor}</p>
            <p className="mt-1 text-[13px] text-bone/45">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BarraMensual datos={datosMensuales} />
        </div>
        <div className="lg:col-span-2">
          <DonaEstados datos={datosEstado} />
        </div>
      </div>

      {stats?.mensajesNuevos > 0 && (
        <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/[0.08] px-5 py-4 text-[13.5px] text-gold backdrop-blur-xl">
          Tienes {stats.mensajesNuevos} mensaje(s) sin leer en la sección Mensajes.
        </div>
      )}
    </div>
  )
}
