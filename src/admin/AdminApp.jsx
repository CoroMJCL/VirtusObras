import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Login from './Login.jsx'
import AdminLayout from './AdminLayout.jsx'
import Dashboard from './Dashboard.jsx'
import Clientes from './Clientes.jsx'
import Presupuestos from './Presupuestos.jsx'
import PresupuestoEditor from './PresupuestoEditor.jsx'
import Proyectos from './Proyectos.jsx'
import Mantenciones from './Mantenciones.jsx'
import Mensajes from './Mensajes.jsx'
import Configuracion from './Configuracion.jsx'

export default function AdminApp() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#eef1f5] text-[#7c8798]">Cargando…</div>
  }

  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="presupuestos" element={<Presupuestos />} />
        <Route path="presupuestos/:id" element={<PresupuestoEditor />} />
        <Route path="proyectos" element={<Proyectos />} />
        <Route path="mantenciones" element={<Mantenciones />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
