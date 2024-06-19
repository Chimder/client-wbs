import React, { useState } from 'react'
import { getChannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'

import { Button } from './ui/button'

type Props = {}

function Header({}: Props) {
  // const [users, setUsers] = useState<number>()
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels(),
    initialData: [],
  })
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">WebSocket Communication</h1>
      {/* <Button>{users}</Button> */}
      {channelsLoading ? (
        <p>Loading channels...</p>
      ) : (
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold">Channels</h2>
          <div className="flex flex-wrap gap-2">
            {channels?.map(channel => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel.id)}
                className={`rounded px-4 py-2 ${selectedChannel === channel.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
