import { useEffect, useState } from 'react'
import { waLink } from '../lib/formatters'

export default function WhatsAppButton({ numero, mensaje }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!numero) return null

  return (
    <a
      href={waLink(numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className={`focus-ring fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-all duration-500 hover:scale-110 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.696 4.607 1.897 6.48L4 29l7.72-1.86A11.93 11.93 0 0 0 16 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3zm0 21.7c-1.94 0-3.75-.55-5.29-1.5l-.38-.23-4.58 1.1 1.12-4.46-.25-.4A9.66 9.66 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7S26.7 9.1 26.7 15 21.9 24.7 16.001 24.7zm5.86-8.02c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.72.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.58-1.6-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.5.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.02-.56-.08-.16-.72-1.75-.99-2.4-.26-.62-.53-.54-.72-.55h-.62c-.21 0-.56.08-.86.4-.29.32-1.13 1.1-1.13 2.7 0 1.6 1.16 3.14 1.32 3.36.16.21 2.28 3.48 5.53 4.88.77.33 1.38.53 1.85.68.78.25 1.48.21 2.04.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z" />
      </svg>
    </a>
  )
}
