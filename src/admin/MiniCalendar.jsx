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

export default function MiniCalendar({ markedDates = [] }) {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const primerDiaSemana = (new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay() + 6) % 7
  const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate()
  const marcados = new Set(markedDates)
  const esMesActualReal = mesActual.getFullYear() === hoy.getFullYear() && mesActual.getMonth() === hoy.getMonth()

  const celdas = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  const cambiarMes = (delta) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1))
  }

  return (
    <div className="rounded-2xl border border-[#dde3ea] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[14px] font-medium tracking-tight text-[#1a2233]">
          {MESES[mesActual.getMonth()]} <span className="text-[#7c8798]">{mesActual.getFullYear()}</span>
        </p>
        <div className="flex gap-0.5">
          <button onClick={() => cambiarMes(-1)} className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-[#7c8798] transition-colors hover:bg-black/[0.04] hover:text-[#1a2233]">
            <ChevronLeft size={15} strokeWidth={1.75} />
          </button>
          <button onClick={() => cambiarMes(1)} className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-[#7c8798] transition-colors hover:bg-black/[0.04] hover:text-[#1a2233]">
            <ChevronRight size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {DIAS.map((d, i) => (
          <span key={i} className="pb-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#a8b3c2]">
            {d}
          </span>
        ))}
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />
          const esHoy = esMesActualReal && d === hoy.getDate()
          const iso = toISODate(new Date(mesActual.getFullYear(), mesActual.getMonth(), d))
          const tieneMarca = marcados.has(iso)
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <button
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12.5px] transition-colors ${
                  esHoy
                    ? 'bg-[#c9a227] font-semibold text-white'
                    : 'text-[#1a2233]/80 hover:bg-black/[0.04]'
                }`}
              >
                {d}
              </button>
              <span className={`h-1 w-1 rounded-full ${tieneMarca && !esHoy ? 'bg-[#c9a227]' : ''}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
