import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon } from 'lucide-react'

// Editor de texto enriquecido minimalista (sin librerías externas).
// Usa contentEditable + document.execCommand, suficiente para negrita,
// cursiva, subrayado, listas y enlaces — lo típico para una sección "Quiénes somos".
export default function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí…' }) {
  const editorRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || ''
      initialized.current = true
    }
  }, [value])

  const ejecutar = (comando, valor = null) => {
    document.execCommand(comando, false, valor)
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML || '')
  }

  const insertarLink = () => {
    const url = prompt('URL del enlace:')
    if (url) ejecutar('createLink', url)
  }

  const BOTONES = [
    { icon: Bold, comando: 'bold', label: 'Negrita' },
    { icon: Italic, comando: 'italic', label: 'Cursiva' },
    { icon: Underline, comando: 'underline', label: 'Subrayado' },
    { icon: List, comando: 'insertUnorderedList', label: 'Lista' },
    { icon: ListOrdered, comando: 'insertOrderedList', label: 'Lista numerada' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-[#c7d0da] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10">
      <div className="flex items-center gap-1 border-b border-[#dde3ea] bg-[#f4f6f9] px-2 py-1.5">
        {BOTONES.map(({ icon: Icon, comando, label }) => (
          <button
            key={comando}
            type="button"
            title={label}
            onMouseDown={(e) => { e.preventDefault(); ejecutar(comando) }}
            className="focus-ring rounded-lg p-2 text-[#5b6472] hover:bg-black/[0.04] hover:text-gold"
          >
            <Icon size={15} />
          </button>
        ))}
        <button
          type="button"
          title="Insertar enlace"
          onMouseDown={(e) => { e.preventDefault(); insertarLink() }}
          className="focus-ring rounded-lg p-2 text-[#5b6472] hover:bg-black/[0.04] hover:text-gold"
        >
          <LinkIcon size={15} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        onBlur={() => onChange(editorRef.current?.innerHTML || '')}
        data-placeholder={placeholder}
        className="rich-text-editable min-h-[160px] px-4 py-3 text-sm text-[#1a2233] focus:outline-none [&_a]:text-gold [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        suppressContentEditableWarning
      />
    </div>
  )
}
