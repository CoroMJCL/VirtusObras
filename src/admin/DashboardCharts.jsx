import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS_ESTADO = {
  cliente: '#8a8f98',
  presupuesto: '#c9a227',
  servicio: '#5b8def',
  cierre: '#3ecf8e',
}

function TooltipOscuro({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-xs text-bone shadow-xl">
      <p className="text-bone/50">{label}</p>
      <p className="font-medium">{payload[0].value}</p>
    </div>
  )
}

export function BarraMensual({ datos }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <p className="mb-1 text-[14px] font-medium text-bone">Presupuestos por mes</p>
      <p className="mb-5 text-[12.5px] text-bone/40">Últimos 6 meses</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={datos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="mes" stroke="#f2f0ea40" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#f2f0ea40" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipOscuro />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="cantidad" fill="#c9a227" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DonaEstados({ datos }) {
  const total = datos.reduce((s, d) => s + d.value, 0)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <p className="mb-1 text-[14px] font-medium text-bone">Estado de presupuestos</p>
      <p className="mb-3 text-[12.5px] text-bone/40">Distribución actual</p>
      {total === 0 ? (
        <div className="flex h-[180px] items-center justify-center text-[13px] text-bone/30">Sin datos todavía</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={datos} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={3}>
                {datos.map((d, i) => (
                  <Cell key={i} fill={COLORS_ESTADO[d.key] || '#8a8f98'} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<TooltipOscuro />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {datos.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5 text-[11.5px] text-bone/50">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS_ESTADO[d.key] || '#8a8f98' }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
