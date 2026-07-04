import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, FolderKanban, BellRing, Mail, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import logo from '../assets/logo-icon.png'

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
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-obsidian text-bone">
      <aside className="flex w-64 flex-none flex-col border-r border-white/10 bg-charcoal">
        <div className="flex items-center gap-3 px-6 py-6">
          <img src={logo} alt="Virtus Obras" className="h-9 w-9 rounded-full" />
          <div>
            <p className="text-sm font-semibold">Virtus | Obras</p>
            <p className="text-xs text-bone/40">Panel administrativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-gold/10 text-gold' : 'text-bone/60 hover:bg-white/5 hover:text-bone'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.6} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="focus-ring m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone/50 hover:bg-white/5 hover:text-red-400"
        >
          <LogOut size={18} strokeWidth={1.6} />
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
