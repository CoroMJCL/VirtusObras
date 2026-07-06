import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import MiniCalendar from './MiniCalendar.jsx'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export default function DatePickerButton({ markedDates = [] }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const hoy = new Date()

  useEffect(() => {
    const onClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((o) => !o)}
        className="focus-ring flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[13px] text-bone/70 backdrop-blur-xl transition-colors hover:border-white/20 hover:text-bone"
      >
        <CalendarDays size={14} className="text-gold" strokeWidth={1.75} />
        {hoy.getDate()} de {MESES[hoy.getMonth()]}
      </button>

      {abierto && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[300px]">
          <MiniCalendar markedDates={markedDates} />
          <p className="mt-2 text-center text-[11px] text-bone/30">
            Los puntos dorados marcan mantenciones programadas.
          </p>
        </div>
      )}
    </div>
  )
}
