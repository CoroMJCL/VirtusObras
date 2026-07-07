// Sección "Quiénes somos" — el contenido viene del panel admin (texto enriquecido).
// Si el ingeniero no ha escrito nada todavía, la sección no se muestra.
export default function AboutUs({ contenidoHtml }) {
  if (!contenidoHtml || contenidoHtml.trim() === '') return null

  return (
    <section id="quienes-somos" className="border-t border-white/5 bg-obsidian py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="eyebrow mb-3 text-xs uppercase text-gold">Quiénes somos</p>
        <div
          className="max-w-none text-[16.5px] leading-[1.85] text-bone/70
            [&>p]:mb-5
            [&_h1]:mt-12 [&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:text-bone
            [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-bone
            [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-gold [&_h3]:first:mt-0
            [&_strong]:font-semibold [&_strong]:text-bone
            [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2
            [&_ul]:mb-6 [&_ul]:mt-3 [&_ul]:list-none [&_ul]:space-y-2.5 [&_ul]:pl-0
            [&_ul_li]:relative [&_ul_li]:pl-6
            [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.65em] [&_ul_li]:before:h-1.5 [&_ul_li]:before:w-1.5 [&_ul_li]:before:rounded-full [&_ul_li]:before:bg-gold/60
            [&_ol]:mb-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5 [&_ol]:marker:text-gold/70"
          dangerouslySetInnerHTML={{ __html: contenidoHtml }}
        />
      </div>
    </section>
  )
}
