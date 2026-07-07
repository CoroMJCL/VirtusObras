import { CheckCircle2 } from 'lucide-react'

// Sección "Quiénes somos": bio libre (rich text) + servicios destacados
// como tarjetas estructuradas + mensaje de cierre opcional.
export default function AboutUs({ contenidoHtml, servicios = [], cierre }) {
  const hayBio = contenidoHtml && contenidoHtml.trim() !== ''
  const hayServicios = Array.isArray(servicios) && servicios.length > 0
  const hayCierre = cierre && cierre.trim() !== ''

  if (!hayBio && !hayServicios && !hayCierre) return null

  return (
    <section id="quienes-somos" className="border-t border-white/5 bg-obsidian py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="eyebrow mb-3 text-xs uppercase text-gold">Quiénes somos</p>

        {hayBio && (
          <div
            className="mb-14 max-w-3xl text-[17px] font-light leading-[1.8] text-bone/75 first:[&>p]:font-display first:[&>p]:text-[21px] first:[&>p]:leading-[1.6] first:[&>p]:text-bone [&>p]:mb-5 [&_strong]:font-medium [&_strong]:text-bone [&_a]:text-gold [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: contenidoHtml }}
          />
        )}

        {hayServicios && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-gold/25"
              >
                <h3 className="font-display text-[19px] font-medium text-bone">{s.titulo}</h3>
                {s.descripcion && (
                  <p className="mt-3 text-[14.5px] leading-relaxed text-bone/55">{s.descripcion}</p>
                )}
                {s.items?.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-bone/65">
                        <CheckCircle2 size={15} className="mt-0.5 flex-none text-gold/70" strokeWidth={1.75} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {hayCierre && (
          <p className="mx-auto mt-14 max-w-2xl text-center text-[15.5px] italic leading-relaxed text-bone/50">
            {cierre}
          </p>
        )}
      </div>
    </section>
  )
}
