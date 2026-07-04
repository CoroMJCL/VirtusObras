const ETAPAS = [
  { key: 'cliente', label: 'Visita técnica', desc: 'Evaluamos el trabajo en terreno y registramos tus datos.' },
  { key: 'presupuesto', label: 'Presupuesto', desc: 'Recibes una cotización formal por correo, sin compromiso.' },
  { key: 'servicio', label: 'Ejecución', desc: 'Realizamos el trabajo con seguimiento fotográfico.' },
  { key: 'cierre', label: 'Cierre y garantía', desc: 'Conformidad del cliente y alertas de mantención si aplica.' },
]

// Elemento signature: reinterpreta la "coupling bar" de la ficha de servicio
// interna del ingeniero como una barra de avance pública.
export default function ProcessBar() {
  return (
    <section id="proceso" className="border-t border-white/5 bg-obsidian py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Cómo trabajamos</p>
        <h2 className="mb-16 font-display text-3xl font-light text-bone sm:text-4xl">
          Un expediente, cuatro etapas
        </h2>

        <div className="relative">
          <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-white/10 sm:block" />
          <div
            className="absolute left-0 top-[18px] hidden h-px bg-gold-gradient sm:block"
            style={{ width: '38%' }}
          />
          <div className="grid gap-10 sm:grid-cols-4">
            {ETAPAS.map((e, i) => (
              <div key={e.key} className="relative">
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-mono ${
                    i === 0
                      ? 'border-gold bg-gold text-obsidian'
                      : 'border-white/20 bg-obsidian text-bone/40'
                  }`}
                >
                  {i + 1}
                </div>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-bone">{e.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bone/50">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
