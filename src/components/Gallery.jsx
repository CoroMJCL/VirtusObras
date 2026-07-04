import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Gallery({ proyectos }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const slides = (proyectos || []).flatMap((p) =>
    (p.proyecto_fotos?.length ? p.proyecto_fotos : [{ url: null }]).slice(0, 1).map((f) => ({
      titulo: p.titulo,
      categoria: p.categoria,
      url: f.url,
    }))
  )

  const scrollToIndex = (i) => {
    const track = trackRef.current
    if (!track) return
    const clamped = (i + slides.length) % slides.length
    setIndex(clamped)
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => scrollToIndex(index + 1), 6000)
    return () => clearInterval(t)
  }, [index, slides.length])

  if (!slides.length) return null

  return (
    <section id="proyectos" className="border-t border-white/5 bg-charcoal py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Proyectos destacados</p>
            <h2 className="font-display text-3xl font-light text-bone sm:text-4xl">Trabajo entregado</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollToIndex(index - 1)}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-bone/70 transition-colors hover:border-gold hover:text-gold"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollToIndex(index + 1)}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-bone/70 transition-colors hover:border-gold hover:text-gold"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <div key={i} className="relative aspect-[16/9] w-full flex-none snap-start">
              {s.url ? (
                <img src={s.url} alt={s.titulo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-graphite text-bone/30">
                  Sin imagen
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                {s.categoria && (
                  <span className="text-xs uppercase tracking-wide text-gold">{s.categoria}</span>
                )}
                <h3 className="mt-1 font-display text-2xl font-light text-bone">{s.titulo}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir a proyecto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-gold' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
