import React from 'react'

export class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#020617',
          color: '#f8fafc',
          padding: '2rem',
          fontFamily: "'Poppins', system-ui, sans-serif"
        }}>
          <h1 style={{ color: '#f43f5e', marginBottom: '1rem' }}>Something went wrong</h1>
          <pre style={{
            background: '#0f172a',
            padding: '1rem',
            borderRadius: '12px',
            overflow: 'auto',
            fontSize: '14px',
            color: '#fca5a5'
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
