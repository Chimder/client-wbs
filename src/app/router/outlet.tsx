import { Outlet } from 'react-router-dom'

import { WebSocketProvider } from '@/components/WebSocketProvider'
import NavBar from '@/components/navBar'

export default function Layout() {
  return (
    <>
      <WebSocketProvider>
        <NavBar />
        <main>
          <Outlet />
        </main>
      </WebSocketProvider>
    </>
  )
}
