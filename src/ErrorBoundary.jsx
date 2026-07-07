import { Component } from 'react'

// Si algo se rompe al renderizar, muestra el error en pantalla en vez de
// dejar la pantalla en negro sin explicación. Esto es temporal para
// diagnosticar el bug reportado en iPhone/Safari — se puede quitar después.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error capturado por ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a0b', color: '#f2f0ea',
          padding: '24px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6,
        }}>
          <p style={{ color: '#e07a5f', fontWeight: 'bold', marginBottom: '12px' }}>
            ⚠️ Error al cargar la página (envía captura de esto)
          </p>
          <p style={{ marginBottom: '8px' }}>{String(this.state.error?.message || this.state.error)}</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', opacity: 0.6 }}>
            {String(this.state.error?.stack || '')}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
