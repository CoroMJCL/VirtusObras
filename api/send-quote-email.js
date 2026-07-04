// Vercel Serverless Function: /api/send-quote-email
// Envía el PDF del presupuesto al correo del cliente usando Resend.
// Requiere las variables de entorno RESEND_API_KEY y RESEND_FROM_EMAIL en Vercel.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { correoCliente, nombreCliente, folio, total, pdfBase64 } = req.body || {}

  if (!correoCliente || !pdfBase64) {
    return res.status(400).json({ error: 'Faltan datos: correoCliente y pdfBase64 son requeridos.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'presupuestos@virtusobras.cl'

  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY no está configurada en Vercel.' })
  }

  const totalFormateado = Number(total || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Virtus | Obras <${from}>`,
        to: [correoCliente],
        subject: `Tu presupuesto ${folio || ''} — Virtus Obras`,
        html: `
          <div style="font-family: Arial, sans-serif; background:#0a0a0b; padding:32px; color:#f2f0ea;">
            <h2 style="color:#c9a227; font-weight:400;">Virtus | Obras</h2>
            <p>Hola ${nombreCliente || ''},</p>
            <p>Adjuntamos tu presupuesto <strong>${folio || ''}</strong> por un total de <strong>${totalFormateado}</strong>.</p>
            <p>Si tienes dudas, respóndenos a este correo o escríbenos por WhatsApp.</p>
            <p style="color:#9a9a9a; font-size:12px; margin-top:24px;">Soluciones Integrales en Obras · Certificación SEC vigente</p>
          </div>
        `,
        attachments: [
          {
            filename: `${folio || 'presupuesto'}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })

    if (!resp.ok) {
      const detalle = await resp.text()
      return res.status(502).json({ error: 'Resend rechazó el envío.', detalle })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al enviar el correo.', detalle: String(err) })
  }
}
