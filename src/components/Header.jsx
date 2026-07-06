import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import logo from '../assets/logo-icon.png'

const LINKS = [
  { href: '#quienes-somos', label: 'Quiénes somos' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#proceso', label: 'Cómo trabajamos' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-obsidian/85 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <img src={logo} alt="Virtus Obras" className="h-9 w-9 rounded-full" />
          <span className="font-display text-lg tracking-[0.01em] text-bone">
            VIRTUS <span className="text-gold">| OBRAS</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="focus-ring text-sm text-bone/70 transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="focus-ring rounded-full border border-gold/40 px-5 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-obsidian"
          >
            Solicitar visita
          </a>
          <a
            href="/admin"
            aria-label="Acceso administrador"
            title="Acceso administrador"
            className="focus-ring text-bone/30 transition-colors hover:text-gold"
          >
            <Settings size={18} strokeWidth={1.6} />
          </a>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <a
            href="/admin"
            aria-label="Acceso administrador"
            className="focus-ring text-bone/30 hover:text-gold"
          >
            <Settings size={18} strokeWidth={1.6} />
          </a>
          <button
            className="focus-ring text-bone"
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-up flex flex-col divide-y divide-white/5 border-t border-white/10 bg-obsidian/90 px-6 py-2 backdrop-blur-xl md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="focus-ring py-3.5 text-[15px] text-bone/80 transition-colors hover:text-gold"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="focus-ring py-3.5 text-[15px] font-medium text-gold"
            onClick={() => setOpen(false)}
          >
            Solicitar visita
          </a>
        </nav>
      )}
    </header>
  )
}
