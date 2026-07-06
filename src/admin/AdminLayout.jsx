import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Receipt, FolderKanban, BellRing, Mail, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import logo from '../assets/logo-icon.png'
import NamePromptModal from './NamePromptModal.jsx'

const NAV = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/presupuestos', label: 'Presupuestos', icon: FileText },
  { to: '/admin/boletas', label: 'Boletas', icon: Receipt },
  { to: '/admin/proyectos', label: 'Proyectos', icon: FolderKanban },
  { to: '/admin/mantenciones', label: 'Mantenciones', icon: BellRing },
  { to: '/admin/mensajes', label: 'Mensajes', icon: Mail },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export default function AdminLayout() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()

  const salir = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const faltaNombre = session && !session.user?.user_metadata?.nombre
  const nombre = session?.user?.user_metadata?.nombre
  const avatarUrl = session?.user?.user_metadata?.avatar_url
  const inicial = (nombre || session?.user?.email || 'A').charAt(0).toUpperCase()

  return (
    <div className="relative flex min-h-screen text-bone">
      {faltaNombre && <NamePromptModal onSaved={() => {}} />}

      {/* Fondo con degradado y resplandores sutiles */}
      <div className="fixed inset-0 -z-10 bg-[#08080a]">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#c9a227]/[0.08] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[450px] w-[450px] rounded-full bg-[#8a6a16]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[100px]" />
      </div>

      <aside className="flex w-[260px] flex-none flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-6 py-7">
          <img src={logo} alt="Virtus Obras" className="h-9 w-9 rounded-full ring-1 ring-white/10" />
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-bone">Virtus | Obras</p>
            <p className="text-[11px] text-bone/40">Panel administrativo</p>
          </div>
        </div>

        {nombre && (
          <div className="mx-4 mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-gold-gradient text-[13px] font-semibold text-[#1a1a1a]">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : inicial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-bone">{nombre}</p>
              <p className="truncate text-[11px] text-bone/40">Administrador</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.07] text-bone shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                    : 'text-bone/45 hover:bg-white/[0.04] hover:text-bone/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={1.75} className={isActive ? 'text-gold' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={salir}
          className="focus-ring m-3 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium text-bone/40 transition-colors hover:bg-white/[0.04] hover:text-red-400"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Salir
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-9">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
