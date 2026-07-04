import { jsPDF } from 'jspdf'
import { formatCLP, formatFecha } from './formatters'

// logoDataUrl: string base64 (dataURL) del logo, se pasa desde el componente
// (evita depender de imports de assets binarios en este módulo)
export function generarPresupuestoPDF({ presupuesto, cliente, logoDataUrl }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = 56

  const GOLD = [201, 162, 39]
  const INK = [20, 20, 22]
  const GRAY = [110, 110, 115]

  // ---- Encabezado con logo ----
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', margin, y - 18, 46, 46)
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text('VIRTUS', margin + 58, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GOLD)
  doc.text(' | OBRAS', margin + 58 + doc.getTextWidth('VIRTUS'), y)

  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('Soluciones Integrales en Obras', margin + 58, y + 14)

  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text('PRESUPUESTO', pageWidth - margin, y - 4, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(presupuesto.folio || '', pageWidth - margin, y + 12, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(`Emitido: ${formatFecha(presupuesto.creado_en || new Date())}`, pageWidth - margin, y + 26, { align: 'right' })
  doc.text(`Válido por ${presupuesto.validez_dias || 15} días`, pageWidth - margin, y + 38, { align: 'right' })

  y += 66
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.2)
  doc.line(margin, y, pageWidth - margin, y)
  y += 24

  // ---- Datos del cliente ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('CLIENTE', margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  const clienteLineas = [
    cliente?.nombre || '—',
    [cliente?.rut, cliente?.telefono].filter(Boolean).join('  ·  '),
    cliente?.correo || '',
    [cliente?.direccion, cliente?.comuna].filter(Boolean).join(', '),
  ].filter(Boolean)
  clienteLineas.forEach((line) => {
    doc.text(line, margin, y)
    y += 14
  })

  y += 12

  if (presupuesto.tipo_trabajo?.length) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...GOLD)
    doc.text(presupuesto.tipo_trabajo.join('  ·  ').toUpperCase(), margin, y)
    y += 20
  }

  if (presupuesto.descripcion) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRAY)
    const desc = doc.splitTextToSize(presupuesto.descripcion, pageWidth - margin * 2)
    doc.text(desc, margin, y)
    y += desc.length * 12 + 12
  }

  // ---- Tabla de items ----
  const items = Array.isArray(presupuesto.items) ? presupuesto.items : []
  const colDesc = margin
  const colCant = pageWidth - margin - 220
  const colPU = pageWidth - margin - 140
  const colTotal = pageWidth - margin

  doc.setFillColor(21, 21, 23)
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F')
  doc.setTextColor(230, 230, 230)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPCIÓN', colDesc + 8, y + 15)
  doc.text('CANT.', colCant, y + 15)
  doc.text('P. UNIT.', colPU, y + 15)
  doc.text('TOTAL', colTotal, y + 15, { align: 'right' })
  y += 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  items.forEach((item, idx) => {
    const rowH = 22
    if (idx % 2 === 1) {
      doc.setFillColor(246, 245, 241)
      doc.rect(margin, y, pageWidth - margin * 2, rowH, 'F')
    }
    doc.setTextColor(30, 30, 30)
    const descLines = doc.splitTextToSize(item.descripcion || '', colCant - colDesc - 16)
    doc.text(descLines[0] || '', colDesc + 8, y + 14)
    doc.text(String(item.cantidad ?? 1), colCant, y + 14)
    doc.text(formatCLP(item.precio_unitario), colPU, y + 14)
    doc.text(formatCLP((item.cantidad || 0) * (item.precio_unitario || 0)), colTotal, y + 14, { align: 'right' })
    y += rowH
    if (y > 700) { doc.addPage(); y = 56 }
  })

  y += 8
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  // ---- Totales ----
  const totalsX = pageWidth - margin - 180
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text('Subtotal', totalsX, y)
  doc.setTextColor(...INK)
  doc.text(formatCLP(presupuesto.subtotal), pageWidth - margin, y, { align: 'right' })
  y += 16

  if (presupuesto.descuento) {
    doc.setTextColor(...GRAY)
    doc.text('Descuento', totalsX, y)
    doc.setTextColor(...INK)
    doc.text('- ' + formatCLP(presupuesto.descuento), pageWidth - margin, y, { align: 'right' })
    y += 16
  }

  y += 4
  doc.setFillColor(...GOLD)
  doc.rect(totalsX - 12, y - 14, pageWidth - margin - totalsX + 12, 26, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', totalsX, y + 4)
  doc.text(formatCLP(presupuesto.total), pageWidth - margin, y + 4, { align: 'right' })

  // ---- Pie de página ----
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      'Virtus | Obras · Soluciones Integrales en Obras · Certificación SEC vigente',
      margin,
      812
    )
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, 812, { align: 'right' })
  }

  return doc
}

export function descargarPresupuestoPDF(params) {
  const doc = generarPresupuestoPDF(params)
  doc.save(`${params.presupuesto?.folio || 'presupuesto'}.pdf`)
}

export function obtenerPresupuestoPDFBase64(params) {
  const doc = generarPresupuestoPDF(params)
  return doc.output('datauristring').split(',')[1]
}
