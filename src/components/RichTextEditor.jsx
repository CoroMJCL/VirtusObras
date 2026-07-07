import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading } from 'lucide-react'

// Editor de texto enriquecido minimalista (sin librerías externas).
// Usa contentEditable + document.execCommand: negrita, cursiva, subrayado,
// títulos, listas y enlaces — lo típico para una sección "Quiénes somos".
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

  const alternarTitulo = () => {
    const bloque = document.queryCommandValue('formatBlock')
    ejecutar('formatBlock', bloque === 'h3' ? 'p' : 'h3')
  }

  const insertarLink = () => {
    const url = prompt('URL del enlace:')
    if (url) ejecutar('createLink', url)
  }

  const BOTONES = [
    { icon: Heading, accion: alternarTitulo, label: 'Título de sección' },
    { icon: Bold, accion: () => ejecutar('bold'), label: 'Negrita' },
    { icon: Italic, accion: () => ejecutar('italic'), label: 'Cursiva' },
    { icon: Underline, accion: () => ejecutar('underline'), label: 'Subrayado' },
    { icon: List, accion: () => ejecutar('insertUnorderedList'), label: 'Lista' },
    { icon: ListOrdered, accion: () => ejecutar('insertOrderedList'), label: 'Lista numerada' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10">
      <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.04] px-2 py-1.5">
        {BOTONES.map(({ icon: Icon, accion, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            onMouseDown={(e) => { e.preventDefault(); accion() }}
            className="focus-ring rounded-lg p-2 text-[#f2f0ea99] hover:bg-white/5 hover:text-gold"
          >
            <Icon size={15} />
          </button>
        ))}
        <button
          type="button"
          title="Insertar enlace"
          onMouseDown={(e) => { e.preventDefault(); insertarLink() }}
          className="focus-ring rounded-lg p-2 text-[#f2f0ea99] hover:bg-white/5 hover:text-gold"
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
        className="rich-text-editable min-h-[160px] px-4 py-3 text-sm text-[#f2f0ea] focus:outline-none [&_a]:text-gold [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gold"
        suppressContentEditableWarning
      />
    </div>
  )
}
