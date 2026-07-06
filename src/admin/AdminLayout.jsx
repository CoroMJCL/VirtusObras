import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, FolderKanban, BellRing, Mail, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import logo from '../assets/logo-icon.png'
import NamePromptModal from './NamePromptModal.jsx'

const NAV = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/presupuestos', label: 'Presupuestos', icon: FileText },
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

  return (
    <div className="flex min-h-screen bg-[#eef1f5] text-[#1a2233]">
      {faltaNombre && <NamePromptModal onSaved={() => {}} />}

      <aside className="flex w-[260px] flex-none flex-col border-r border-[#dde3ea] bg-white">
        <div className="flex items-center gap-3 px-6 py-7">
          <img src={logo} alt="Virtus Obras" className="h-8 w-8 rounded-full" />
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-[#1a2233]">Virtus | Obras</p>
            <p className="text-[11px] text-[#7c8798]">Panel administrativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c9a227]/10 text-[#1a2233]'
                    : 'text-[#5b6472] hover:bg-black/[0.03] hover:text-[#1a2233]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={1.75} className={isActive ? 'text-[#a8841b]' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={salir}
          className="focus-ring m-3 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium text-[#5b6472] transition-colors hover:bg-black/[0.03] hover:text-red-600"
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
