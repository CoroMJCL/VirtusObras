import heroBg from '../assets/hero-bg.png'
import SECBadge from './SECBadge.jsx'

export default function Hero({ titulo, subtitulo, numeroWhatsapp }) {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          role="presentation"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/60 to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/30 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-24">
        <p className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-obsidian/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
          Ingeniería en construcción · Santiago
        </p>

        <h1
          className="animate-fade-up max-w-2xl font-display text-5xl font-light leading-[1.08] text-bone sm:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.1s' }}
        >
          {titulo || (
            <>
              Soluciones integrales<br />en <span className="text-gold-gradient">obras</span>
            </>
          )}
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-bone/70"
          style={{ animationDelay: '0.2s' }}
        >
          {subtitulo ||
            'Gasfitería, mueblería a medida, puertas y ventanas, y asesoría técnica — con el respaldo de un ingeniero en construcción certificado SEC.'}
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center gap-4"
          style={{ animationDelay: '0.3s' }}
        >
          <a
            href="#contacto"
            className="focus-ring rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-medium text-obsidian shadow-[0_10px_40px_rgba(201,162,39,0.25)] transition-transform hover:scale-[1.03]"
          >
            Solicitar presupuesto
          </a>
          <a
            href="#proyectos"
            className="focus-ring rounded-full border border-white/20 px-7 py-3.5 text-sm text-bone/80 transition-colors hover:border-gold/50 hover:text-gold"
          >
            Ver proyectos
          </a>
        </div>

        <div className="animate-fade-up mt-14 max-w-xs" style={{ animationDelay: '0.4s' }}>
          <SECBadge />
        </div>
      </div>
    </section>
  )
}
