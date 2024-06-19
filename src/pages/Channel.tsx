// Channel.tsx
import React from 'react'

import Chat from '@/components/Chat'
import PodChannelList from '@/components/PodChannelList'

const Channel: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <PodChannelList />
    </div>
  )
}

export default Channel
