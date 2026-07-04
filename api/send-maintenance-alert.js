// Vercel Serverless Function: /api/send-maintenance-alert
// Envía un correo al cliente y una notificación push (OneSignal) al ingeniero
// cuando se acerca la fecha de mantención de un equipo instalado (ej: calefont).
// Requiere: RESEND_API_KEY, RESEND_FROM_EMAIL, ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { equipo, proximaFecha, correoCliente, nombreCliente } = req.body || {}

  const fechaFormateada = proximaFecha
    ? new Date(proximaFecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  const resultados = { correoCliente: null, pushIngeniero: null }

  // 1) Correo al cliente (si tiene correo registrado)
  if (correoCliente && process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Virtus | Obras <${process.env.RESEND_FROM_EMAIL || 'presupuestos@virtusobras.cl'}>`,
          to: [correoCliente],
          subject: `Recordatorio de mantención — ${equipo || 'tu instalación'}`,
          html: `
            <div style="font-family: Arial, sans-serif; background:#0a0a0b; padding:32px; color:#f2f0ea;">
              <h2 style="color:#c9a227; font-weight:400;">Virtus | Obras</h2>
              <p>Hola ${nombreCliente || ''},</p>
              <p>Te recordamos que <strong>${equipo || 'tu instalación'}</strong> tiene mantención programada
                 para el <strong>${fechaFormateada}</strong>.</p>
              <p>Escríbenos por WhatsApp para coordinar la visita técnica.</p>
              <p style="color:#9a9a9a; font-size:12px; margin-top:24px;">Soluciones Integrales en Obras · Certificación SEC vigente</p>
            </div>
          `,
        }),
      })
      resultados.correoCliente = resp.ok
    } catch {
      resultados.correoCliente = false
    }
  }

  // 2) Push al ingeniero vía OneSignal (a todos los suscriptores del sitio admin)
  if (process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY) {
    try {
      const resp = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID,
          included_segments: ['Subscribed Users'],
          headings: { en: 'Mantención próxima' },
          contents: { en: `${equipo || 'Instalación'} de ${nombreCliente || 'cliente'} — ${fechaFormateada}` },
        }),
      })
      resultados.pushIngeniero = resp.ok
    } catch {
      resultados.pushIngeniero = false
    }
  }

  return res.status(200).json({ ok: true, resultados })
}
