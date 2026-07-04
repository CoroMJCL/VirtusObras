export function formatCLP(value) {
  const n = Number(value) || 0
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

export function formatFecha(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function waLink(numero, mensaje) {
  const clean = (numero || '').replace(/\D/g, '')
  const texto = encodeURIComponent(mensaje || 'Hola, quiero cotizar un servicio con Virtus Obras')
  return `https://wa.me/${clean}?text=${texto}`
}
