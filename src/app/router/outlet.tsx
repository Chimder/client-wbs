import { Outlet } from 'react-router-dom'

import Header from '@/components/Header'
import { WebSocketProvider } from '@/components/WebSocketProvider'

export default function Layout() {
  return (
    <>
      <WebSocketProvider>
        <Header />
        <main>
          <Outlet />
        </main>
      </WebSocketProvider>
    </>
  )
}
