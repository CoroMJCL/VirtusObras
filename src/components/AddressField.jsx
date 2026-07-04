import { useEffect, useRef, useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'

let scriptCargado = null

function cargarGoogleMaps(apiKey) {
  if (scriptCargado) return scriptCargado
  scriptCargado = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) return resolve(window.google)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=CL`
    script.async = true
    script.onload = () => resolve(window.google)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return scriptCargado
}

// Campo de dirección con autocompletado y validación de Google Maps.
// Si no hay VITE_GOOGLE_MAPS_API_KEY configurada, cae a un input normal
// con un enlace para verificar manualmente la dirección en Google Maps.
export default function AddressField({ value, onChange, onPlaceSelected, placeholder = 'Dirección del servicio' }) {
  const inputRef = useRef(null)
  const [listo, setListo] = useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey || !inputRef.current) return
    let autocomplete
    cargarGoogleMaps(apiKey)
      .then((google) => {
        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'cl' },
          fields: ['formatted_address', 'geometry', 'address_components'],
        })
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            onChange(place.formatted_address)
            onPlaceSelected?.(place)
          }
        })
        setListo(true)
      })
      .catch(() => setListo(false))

    return () => {
      if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  const linkMapsManual = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 pr-10 text-sm text-bone"
      />
      {apiKey && listo ? (
        <MapPin size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold/60" />
      ) : (
        value && (
          <a
            href={linkMapsManual}
            target="_blank"
            rel="noopener noreferrer"
            title="Verificar dirección en Google Maps"
            className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-bone/30 hover:text-gold"
          >
            <ExternalLink size={15} />
          </a>
        )
      )}
    </div>
  )
}
