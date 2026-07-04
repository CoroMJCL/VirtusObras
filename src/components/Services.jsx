import { Droplets, Hammer, DoorOpen, ClipboardCheck, Wrench } from 'lucide-react'

const ICONS = { droplets: Droplets, hammer: Hammer, 'door-open': DoorOpen, 'clipboard-check': ClipboardCheck }

export default function Services({ servicios }) {
  return (
    <section id="servicios" className="border-t border-white/5 bg-charcoal py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Qué hacemos</p>
          <h2 className="font-display text-3xl font-light text-bone sm:text-4xl">
            Cuatro especialidades, un mismo estándar
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2">
          {servicios.map((s) => {
            const Icon = ICONS[s.icono] || Wrench
            return (
              <div
                key={s.id || s.slug}
                className="group relative bg-obsidian p-9 transition-colors duration-500 hover:bg-graphite"
              >
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.4} />
                <h3 className="mt-6 font-display text-xl font-light text-bone">{s.nombre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone/55">{s.descripcion}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
