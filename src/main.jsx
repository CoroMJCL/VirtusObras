import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

// Captura errores de script que ocurren ANTES de que React alcance a montar
// (ej: un import que falla), y los muestra en pantalla en vez de dejarla negra.
window.addEventListener('error', (event) => {
  const root = document.getElementById('root')
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `
      <div style="min-height:100vh;background:#0a0a0b;color:#f2f0ea;padding:24px;font-family:monospace;font-size:13px;line-height:1.6;">
        <p style="color:#e07a5f;font-weight:bold;margin-bottom:12px;">⚠️ Error al cargar la página (envía captura de esto)</p>
        <p>${(event.message || 'Error desconocido').toString()}</p>
        <p style="opacity:0.6;font-size:11px;margin-top:8px;">${event.filename || ''}:${event.lineno || ''}</p>
      </div>`
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
