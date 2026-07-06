// Sección "Quiénes somos" — el contenido viene del panel admin (texto enriquecido).
// Si el ingeniero no ha escrito nada todavía, la sección no se muestra.
export default function AboutUs({ contenidoHtml }) {
  if (!contenidoHtml || contenidoHtml.trim() === '') return null

  return (
    <section id="quienes-somos" className="border-t border-white/5 bg-obsidian py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="eyebrow mb-3 text-xs uppercase text-gold">Quiénes somos</p>
        <div
          className="prose-virtus max-w-none text-[17px] leading-relaxed text-bone/75 [&_a]:text-gold [&_a]:underline [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-bone [&_h2]:text-bone [&_h3]:text-bone [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-bone [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: contenidoHtml }}
        />
      </div>
    </section>
  )
}
