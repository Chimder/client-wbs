import { useContext, useEffect } from 'react'
import { QueriesPodchannel } from '@/shared/api/generated'
import {
  Link,
  ScrollRestoration,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { Button } from './ui/button'
import { WebSocketContext } from './WebSocketProvider'

interface Props {
  data?: QueriesPodchannel[]
}

export default function PodChannelList({ data }: Props) {
  const navigate = useNavigate()
  const { channelID } = useParams()
  const { socket, sendJoinUser } = useContext(WebSocketContext)
  if (!channelID) {
    navigate('/')
    return null
  }

  useEffect(() => {
    if (socket && channelID) {
      sendJoinUser(channelID)
    }
  }, [channelID])

  return (
    <div className="h-full w-64 overflow-y-auto bg-gray-700 p-4">
      <div className="flex flex-col gap-2">
        {data &&
          data.map(podchannel => (
            <Link
              to={`/channel/${channelID}/${podchannel.id}`}
            >
              <Button
                key={podchannel.id}
                className={`rounded w-full px-4 py-2 ${'bg-green-500 text-white'}`}
              >
                {podchannel.name}
              </Button>
            </Link>
          ))}
      </div>
    </div>
  )
}
