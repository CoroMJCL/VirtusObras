import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

// Calendario mensual simple, sin dependencias externas.
// markedDates: array de strings 'YYYY-MM-DD' que se muestran con un punto dorado (ej: mantenciones próximas).
export default function MiniCalendar({ markedDates = [] }) {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const primerDiaSemana = (new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay() + 6) % 7 // lunes=0
  const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate()
  const marcados = new Set(markedDates)

  const celdas = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  const cambiarMes = (delta) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1))
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-bone">
          {MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
        </p>
        <div className="flex gap-1">
          <button onClick={() => cambiarMes(-1)} className="focus-ring rounded-lg p-1.5 text-bone/40 hover:bg-white/5 hover:text-gold">
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => cambiarMes(1)} className="focus-ring rounded-lg p-1.5 text-bone/40 hover:bg-white/5 hover:text-gold">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d, i) => (
          <span key={i} className="eyebrow py-1 text-[10px] text-bone/30">{d}</span>
        ))}
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />
          const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), d)
          const iso = toISODate(fecha)
          const esHoy = iso === toISODate(hoy)
          const tieneMarca = marcados.has(iso)
          return (
            <div key={i} className="relative flex justify-center py-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  esHoy ? 'bg-gold-gradient font-semibold text-obsidian' : 'text-bone/70'
                }`}
              >
                {d}
              </span>
              {tieneMarca && !esHoy && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-gold" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
