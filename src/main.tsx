import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { applyModelCode } from './config/presets'
import './styles/globals.css'

// ?codigo=T1-C4-M5 no endereço aplica o modelo (tema, cores e menu) e sai da URL.
const params = new URLSearchParams(window.location.search)
const code = params.get('codigo')
if (code && applyModelCode(code)) {
  params.delete('codigo')
  const query = params.toString()
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root não encontrado.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
