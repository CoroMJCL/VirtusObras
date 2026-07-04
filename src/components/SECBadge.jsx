import secBadge from '../assets/sec-badge.png'

export const SEC_VALIDADOR_URL = 'https://wlhttp.sec.cl/validadorInstaladores/sec/consulta.do'

export default function SECBadge({ variant = 'inline' }) {
  if (variant === 'inline') {
    return (
      <a
        href={SEC_VALIDADOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm transition-colors hover:border-gold/40"
      >
        <img src={secBadge} alt="Certificación SEC" className="h-10 w-auto rounded bg-white p-0.5" />
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-bone group-hover:text-gold">Certificación SEC</p>
          <p className="text-[11px] text-bone/50">Verificar con RUT →</p>
        </div>
      </a>
    )
  }
  return <img src={secBadge} alt="Certificación SEC" className="h-14 w-auto rounded bg-white p-1" />
}
