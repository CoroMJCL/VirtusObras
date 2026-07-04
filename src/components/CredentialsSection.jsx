import { ExternalLink, ShieldCheck } from 'lucide-react'
import secBadge from '../assets/sec-badge.png'
import duocLogo from '../assets/duoc-logo.png'
import { SEC_VALIDADOR_URL } from './SECBadge.jsx'

const DUOC_VALIDADOR_URL = 'https://certificadovalida.duoc.cl/'

const CREDENCIALES = [
  {
    href: DUOC_VALIDADOR_URL,
    logo: duocLogo,
    logoClass: 'h-12 w-auto',
    titulo: 'Título profesional verificable',
    texto:
      'El título de Ingeniero en Construcción está registrado en DuocUC. Ingresa el RUT del ingeniero en el validador oficial para confirmarlo.',
  },
  {
    href: SEC_VALIDADOR_URL,
    logo: secBadge,
    logoClass: 'h-12 w-auto rounded bg-white p-1',
    titulo: 'Instalador certificado SEC',
    texto:
      'La certificación SEC está vigente ante la Superintendencia de Electricidad y Combustibles. Ingresa el RUT en el validador oficial para confirmarlo.',
  },
]

export default function CredentialsSection() {
  return (
    <section className="border-t border-white/5 bg-charcoal py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Transparencia</p>
            <h2 className="font-display text-2xl font-light text-bone sm:text-3xl">Credenciales verificables</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {CREDENCIALES.map((c) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring group flex flex-col gap-4 rounded-2xl border border-white/10 bg-obsidian p-7 transition-colors hover:border-gold/40"
            >
              <div className="flex items-center justify-between">
                <img src={c.logo} alt={c.titulo} className={c.logoClass} />
                <ExternalLink size={16} className="text-bone/30 group-hover:text-gold" />
              </div>
              <h3 className="font-display text-lg font-light text-bone">{c.titulo}</h3>
              <p className="text-sm leading-relaxed text-bone/55">{c.texto}</p>
              <span className="mt-auto text-xs font-medium uppercase tracking-wide text-gold">
                Validar con RUT en el sitio oficial →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
