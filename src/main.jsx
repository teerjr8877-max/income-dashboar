import { React, createRoot, html } from './lib/react.js'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  html`<${React.StrictMode}><${ErrorBoundary}><${App} /></${ErrorBoundary}></${React.StrictMode}>`,
)
