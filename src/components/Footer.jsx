import logo from '../assets/logo-icon.png'
import SECBadge from './SECBadge.jsx'

export default function Footer({ numeroWhatsapp }) {
  return (
    <footer className="border-t border-white/5 bg-obsidian py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 text-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Virtus Obras" className="h-10 w-10 rounded-full" />
          <span className="font-display text-lg text-bone">
            VIRTUS <span className="text-gold">| OBRAS</span>
          </span>
        </div>
        <p className="max-w-sm text-sm text-bone/45">Soluciones Integrales en Obras</p>
        <SECBadge />
        <p className="text-xs text-bone/30">
          © {new Date().getFullYear()} Virtus Obras. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
