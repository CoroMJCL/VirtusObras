import { useEffect, useState } from 'react'
import { Plus, Trash2, Star, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

const MAX_FOTOS = 10

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [abierto, setAbierto] = useState(null) // proyecto en edición
  const [subiendo, setSubiendo] = useState(false)

  const cargar = async () => {
    const { data } = await supabase
      .from('proyectos')
      .select('*, proyecto_fotos(*)')
      .order('creado_en', { ascending: false })
    setProyectos(data || [])
  }

  useEffect(() => {
    cargar()
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
    supabase.from('servicios').select('slug, nombre').then(({ data }) => setServicios(data || []))
  }, [])

  const crearProyecto = async () => {
    const { data, error } = await supabase
      .from('proyectos')
      .insert([{ titulo: 'Nuevo proyecto', cliente_id: clientes[0]?.id || null }])
      .select('*, proyecto_fotos(*)')
      .single()
    if (!error) {
      setProyectos([data, ...proyectos])
      setAbierto(data)
    }
  }

  const actualizarProyecto = async (id, campos) => {
    await supabase.from('proyectos').update(campos).eq('id', id)
    cargar()
  }

  const eliminarProyecto = async (id) => {
    if (!confirm('¿Eliminar este proyecto y sus fotos?')) return
    await supabase.from('proyectos').delete().eq('id', id)
    setAbierto(null)
    cargar()
  }

  const subirFotos = async (proyecto, files) => {
    const restantes = MAX_FOTOS - (proyecto.proyecto_fotos?.length || 0)
    const lista = Array.from(files).slice(0, restantes)
    if (lista.length === 0) return
    setSubiendo(true)
    for (const file of lista) {
      const ext = file.name.split('.').pop()
      const path = `${proyecto.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('proyecto-fotos').upload(path, file)
      if (uploadError) continue
      const { data: urlData } = supabase.storage.from('proyecto-fotos').getPublicUrl(path)
      await supabase.from('proyecto_fotos').insert([{ proyecto_id: proyecto.id, url: urlData.publicUrl }])
    }
    setSubiendo(false)
    const { data } = await supabase.from('proyectos').select('*, proyecto_fotos(*)').eq('id', proyecto.id).single()
    setAbierto(data)
    cargar()
  }

  const actualizarDescripcionFoto = async (fotoId, descripcion) => {
    await supabase.from('proyecto_fotos').update({ descripcion }).eq('id', fotoId)
  }

  const eliminarFoto = async (foto, proyectoId) => {
    await supabase.from('proyecto_fotos').delete().eq('id', foto.id)
    const path = foto.url.split('/proyecto-fotos/')[1]
    if (path) await supabase.storage.from('proyecto-fotos').remove([path])
    const { data } = await supabase.from('proyectos').select('*, proyecto_fotos(*)').eq('id', proyectoId).single()
    setAbierto(data)
    cargar()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-[#f2f0ea]">Proyectos</h1>
        <button onClick={crearProyecto} className="focus-ring flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-obsidian">
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {proyectos.map((p) => (
          <button
            key={p.id} onClick={() => setAbierto(p)}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition-colors hover:border-gold/30"
          >
            <div className="relative aspect-video bg-graphite">
              {p.proyecto_fotos?.[0]?.url ? (
                <img src={p.proyecto_fotos[0].url} alt={p.titulo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#f2f0ea4d] text-sm">Sin fotos</div>
              )}
              {p.destacado && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-obsidian">
                  <Star size={10} fill="currentColor" /> Destacado
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-[#f2f0ea]">{p.titulo}</p>
              <p className="text-xs text-[#f2f0ea73]">{p.proyecto_fotos?.length || 0}/{MAX_FOTOS} fotos</p>
            </div>
          </button>
        ))}
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg text-[#f2f0ea]">Editar proyecto</h2>
              <button onClick={() => setAbierto(null)} className="focus-ring text-[#f2f0ea73] hover:text-[#f2f0ea]"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <input
                value={abierto.titulo} onChange={(e) => setAbierto({ ...abierto, titulo: e.target.value })}
                onBlur={(e) => actualizarProyecto(abierto.id, { titulo: e.target.value })}
                placeholder="Título del proyecto"
                className="focus-ring w-full rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={abierto.categoria || ''}
                  onChange={(e) => { setAbierto({ ...abierto, categoria: e.target.value }); actualizarProyecto(abierto.id, { categoria: e.target.value }) }}
                  className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3]"
                >
                  <option value="" className="bg-[#141416]">Categoría…</option>
                  {servicios.map((s) => <option key={s.slug} value={s.nombre} className="bg-[#141416]">{s.nombre}</option>)}
                </select>
                <select
                  value={abierto.cliente_id || ''}
                  onChange={(e) => { setAbierto({ ...abierto, cliente_id: e.target.value }); actualizarProyecto(abierto.id, { cliente_id: e.target.value }) }}
                  className="focus-ring rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0eab3]"
                >
                  <option value="" className="bg-[#141416]">Cliente…</option>
                  {clientes.map((c) => <option key={c.id} value={c.id} className="bg-[#141416]">{c.nombre}</option>)}
                </select>
              </div>

              <textarea
                rows={2} value={abierto.descripcion || ''} onChange={(e) => setAbierto({ ...abierto, descripcion: e.target.value })}
                onBlur={(e) => actualizarProyecto(abierto.id, { descripcion: e.target.value })}
                placeholder="Descripción del trabajo realizado"
                className="focus-ring w-full resize-none rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus:border-[#c9a227]/60 focus:ring-2 focus:ring-[#c9a227]/10 px-4 py-2.5 text-sm text-[#f2f0ea]"
              />

              <label className="flex items-center gap-2 text-sm text-[#f2f0eab3]">
                <input
                  type="checkbox" checked={!!abierto.destacado}
                  onChange={(e) => { setAbierto({ ...abierto, destacado: e.target.checked }); actualizarProyecto(abierto.id, { destacado: e.target.checked }) }}
                  className="h-4 w-4 rounded border-white/15 bg-transparent accent-[#c9a227]"
                />
                Mostrar en el carrusel de la página principal
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[#f2f0ea]">
                    Fotos ({abierto.proyecto_fotos?.length || 0}/{MAX_FOTOS})
                  </label>
                  {(abierto.proyecto_fotos?.length || 0) < MAX_FOTOS && (
                    <label className="focus-ring flex cursor-pointer items-center gap-1.5 text-xs text-gold hover:underline">
                      <Upload size={13} /> {subiendo ? 'Subiendo…' : 'Subir fotos'}
                      <input
                        type="file" accept="image/*" multiple hidden disabled={subiendo}
                        onChange={(e) => subirFotos(abierto, e.target.files)}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(abierto.proyecto_fotos || []).map((foto) => (
                    <div key={foto.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                      <img src={foto.url} alt={foto.descripcion || ''} className="aspect-square w-full object-cover" />
                      <button
                        onClick={() => eliminarFoto(foto, abierto.id)}
                        className="focus-ring absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                      <input
                        defaultValue={foto.descripcion || ''}
                        onBlur={(e) => actualizarDescripcionFoto(foto.id, e.target.value)}
                        placeholder="Descripción…"
                        className="focus-ring w-full bg-black/70 px-2 py-1 text-[11px] text-[#f2f0eab3] placeholder:text-[#f2f0ea59]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => eliminarProyecto(abierto.id)}
                className="focus-ring flex items-center gap-2 text-sm text-red-400 hover:underline"
              >
                <Trash2 size={14} /> Eliminar proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
