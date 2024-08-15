// PodChannelList.tsx
import { useContext, useEffect } from 'react'
import { QueriesPodchannel } from '@/shared/api/generated'
import { useNavigate, useParams } from 'react-router-dom'

import { WebSocketContext } from './WebSocketProvider'

interface Props {
  data?: QueriesPodchannel[]
}

export default function PodChannelList({ data }: Props) {
  const navigate = useNavigate()
  const { channelID } = useParams()
  const { socket, sendJoinUser } = useContext(WebSocketContext)

  console.log('PARAM', channelID)
  useEffect(() => {
    if (socket && channelID) {
      sendJoinUser(channelID)
    }
  }, [channelID])

  return (
    <div className="h-full w-64 overflow-y-auto bg-gray-700 p-4">
      <div className="flex flex-col gap-2">
        {data?.map(podchannel => (
          <button
            key={podchannel.id}
            onClick={() => navigate(`/channel/${channelID}/${podchannel.id}`)}
            className={`rounded px-4 py-2 ${
              // podchannelID === String(podchannel.id)
              'bg-green-500 text-white'
              // : 'bg-gray-200'
            }`}
          >
            {podchannel.name}
          </button>
        ))}
      </div>
    </div>
  )
}
