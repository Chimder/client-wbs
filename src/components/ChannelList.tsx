// ChannelList.tsx
import React from 'react'
import { getChannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

const ChannelList: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    initialData: [],
  })

  return (
    <div className="mb-4">
      <h2 className="mb-2 text-xl font-semibold">Каналы</h2>
      {channelsLoading ? (
        <p>Загрузка каналов...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => navigate(`/channel/${channel.id}`)}
              className={`rounded px-4 py-2 ${
                params.id === String(channel.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {channel.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChannelList
