// PodChannel.tsx
import React from 'react'
import { ScrollRestoration } from 'react-router-dom'

import Chat from '@/components/Chat'

const PodChannel: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <ScrollRestoration
        getKey={(location, matches) => {
          if (location.pathname.startsWith('/channels/')) {
            return location.pathname
          }
          return location.key
        }}
      />
      <Chat />
    </div>
  )
}

export default PodChannel
