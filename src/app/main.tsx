import ReactDOM from 'react-dom/client'

import './globals.css'


import Providers from './providers.tsx'
import Routes from './router/routes.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Providers>
    <Routes />
  </Providers>,
  // </React.StrictMode>,
)
