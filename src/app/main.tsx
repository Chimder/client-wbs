import React from 'react'
import ReactDOM from 'react-dom/client'

import './globals.css'

import { App } from '../pages/App.tsx'
import Providers from './providers.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
)
