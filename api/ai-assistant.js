// Vercel Serverless Function: /api/ai-assistant
// Asistente que ayuda al visitante a identificar qué servicio necesita.
// Usa Groq (Llama 3.3), igual que en los otros proyectos de TEMPVS7.
// Requiere GROQ_API_KEY en las variables de entorno de Vercel.

const SYSTEM_PROMPT = `Eres el asistente virtual de Virtus | Obras, una empresa de servicios de construcción en Santiago de Chile dirigida por un ingeniero en construcción certificado SEC.

Servicios que ofrece la empresa:
- Gasfitería: instalación y reparación de redes de agua, calefont, grifería, artefactos sanitarios.
- Mueblería a medida: muebles de cocina y closets a medida, en madera y melamina.
- Puertas y ventanas: reparación, ajuste e instalación.
- Asesoría técnica: evaluación e inspección técnica de obra por ingeniero certificado SEC (ideal para compra de propiedades, ampliaciones, regularizaciones, dudas normativas).

Tu trabajo es conversar brevemente con el visitante, entender su problema o necesidad, y decirle con claridad qué servicio de los cuatro debe contratar y por qué. Si el problema no calza claramente en ninguno, sugiere la asesoría técnica para que el ingeniero lo evalúe en terreno.

Reglas:
- Responde siempre en español de Chile, de forma cercana y profesional, en máximo 3-4 frases.
- Nunca inventes precios, plazos ni disponibilidad: para eso invita a solicitar un presupuesto o escribir por WhatsApp.
- No dés instrucciones técnicas de reparación paso a paso (riesgo de seguridad); tu rol es orientar sobre qué servicio contratar, no reemplazar la visita técnica.
- Si detectas una emergencia (fuga de gas, agua, cortocircuito), indica primero cortar la llave de paso o el suministro correspondiente y contactar de inmediato por WhatsApp.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { messages } = req.body || {}
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere un arreglo "messages".' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY no está configurada en Vercel.' })
  }

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-10)],
        temperature: 0.4,
        max_tokens: 300,
      }),
    })

    if (!resp.ok) {
      const detalle = await resp.text()
      return res.status(502).json({ error: 'Groq rechazó la solicitud.', detalle })
    }

    const data = await resp.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'No pude generar una respuesta, escríbenos por WhatsApp.'
    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del asistente.', detalle: String(err) })
  }
}
