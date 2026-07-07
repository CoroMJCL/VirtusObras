import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import AboutUs from '../components/AboutUs.jsx'
import Services from '../components/Services.jsx'
import ProcessBar from '../components/ProcessBar.jsx'
import CredentialsSection from '../components/CredentialsSection.jsx'
import Gallery from '../components/Gallery.jsx'
import ContactForm from '../components/ContactForm.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import AIAssistant from '../components/AIAssistant.jsx'

const SERVICIOS_FALLBACK = [
  { slug: 'gasfiteria', nombre: 'Gasfitería', icono: 'droplets', descripcion: 'Instalación y reparación de redes de agua, calefont, grifería y artefactos sanitarios.' },
  { slug: 'muebleria', nombre: 'Mueblería a medida', icono: 'hammer', descripcion: 'Diseño y fabricación de muebles de cocina y closets a medida.' },
  { slug: 'puertas-ventanas', nombre: 'Puertas y ventanas', icono: 'door-open', descripcion: 'Reparación, ajuste e instalación de puertas, ventanas y sistemas de cierre.' },
  { slug: 'asesoria-tecnica', nombre: 'Asesoría técnica', icono: 'clipboard-check', descripcion: 'Evaluación e inspección técnica de obra por ingeniero certificado SEC.' },
]

export default function Landing() {
  const [config, setConfig] = useState(null)
  const [servicios, setServicios] = useState(SERVICIOS_FALLBACK)
  const [proyectos, setProyectos] = useState([])

  useEffect(() => {
    let activo = true

    supabase.from('config_sitio').select('*').eq('id', 1).single().then(({ data }) => {
      if (activo && data) setConfig(data)
    })

    supabase.from('servicios').select('*').eq('activo', true).order('orden').then(({ data }) => {
      if (activo && data?.length) setServicios(data)
    })

    supabase
      .from('proyectos')
      .select('id, titulo, categoria, destacado, proyecto_fotos(url, orden)')
      .eq('destacado', true)
      .order('creado_en', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (activo && data) setProyectos(data)
      })

    return () => { activo = false }
  }, [])

  const numeroWhatsapp = config?.whatsapp_numero || import.meta.env.VITE_WHATSAPP_NUMBER

  return (
    <div className="min-h-screen bg-obsidian">
      <Header />
      <Hero
        titulo={config?.hero_titulo}
        subtitulo={config?.hero_subtitulo}
        numeroWhatsapp={numeroWhatsapp}
      />
      <AboutUs
        contenidoHtml={config?.quienes_somos_html}
        servicios={config?.quienes_somos_servicios}
        cierre={config?.quienes_somos_cierre}
      />
      <Services servicios={servicios} />
      <ProcessBar />
      <CredentialsSection />
      <Gallery proyectos={proyectos} />
      <ContactForm costoVisita={config?.costo_visita} />
      <Footer numeroWhatsapp={numeroWhatsapp} />
      <WhatsAppButton numero={numeroWhatsapp} mensaje={config?.whatsapp_mensaje_defecto} />
      <AIAssistant />
    </div>
  )
}
