import { React, html } from '../lib/react.js'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Application render failure:', error)
  }

  render() {
    if (this.state.hasError) {
      return html`<div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100"><div className="w-full max-w-lg rounded-[28px] border border-slate-800 bg-slate-900/80 p-8 shadow-panel backdrop-blur-xl"><p className="text-sm uppercase tracking-[0.3em] text-brand-300">WealthOS recovery</p><h1 className="mt-3 text-3xl font-semibold text-white">Something went wrong loading the app</h1><p className="mt-4 text-sm leading-7 text-slate-300">The current screen crashed while rendering. Your locally stored data was not intentionally cleared. Try reloading to recover.</p><button type="button" onClick=${() => window.location.reload()} className="mt-6 rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400">Reload app</button></div></div>`
    }

    return this.props.children
  }
}
