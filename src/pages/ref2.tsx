import React, { useEffect, useState } from 'react'
import {
  getPodchannelMessage,
  GetPodchannelResult,
} from '@/shared/api/generated'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

const Channel: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const data = useLoaderData() as GetPodchannelResult

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [liveMessages, setLiveMessages] = useState<
    { id: number; content: string; created_at: Date }[]
  >([])

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')

    newSocket.onopen = () => {
      console.log('Connected to server')
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const message = JSON.parse(event.data)
      console.log('EVENT', message)

      if (message.event !== 'users') {
        setLiveMessages((prevMessages: any) => [
          ...prevMessages,
          {
            id: message.id,
            content: `User: ${message.data}`,
            created_at: new Date(),
          },
        ])
      }
    }

    newSocket.onerror = error => {
      console.error('WebSocket error:', error)
    }

    newSocket.onclose = () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    }

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const sendMessage = () => {
    if (socket && inputValue.trim() !== '') {
      const message = JSON.stringify({
        event: 'message',
        data: inputValue,
        channel_id: params.id,
        podchannel_id: params.podID,
      })
      socket.send(message)
      setInputValue('')
    }
  }

  const fetchMessages = async ({ pageParam = 0 }) => {
    const response = await getPodchannelMessage({
      podchannel_id: Number(params.podID),
      limit: 10,
      offset: pageParam * 10,
    })
    return response
  }
  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', params.podID],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) {
        return undefined
      }
      return pages.length
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  return (
    <div className="container mx-auto p-4">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Podchannels</h2>
        <div className="flex flex-wrap gap-2">
          {data?.map(podchannel => (
            <button
              key={podchannel.id}
              onClick={() => navigate(`/channel/${params.id}/${podchannel.id}`)}
              className={`rounded px-4 py-2 ${params.podID === String(podchannel.id) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              {podchannel.name}
            </button>
          ))}
        </div>
      </div>
      {params.podID && (
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold">Chat</h2>
          <div className="mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter message"
              className="mb-2 w-full rounded border p-2"
            />
            <button
              onClick={sendMessage}
              className="rounded bg-blue-500 px-4 py-2 text-white"
              disabled={!isConnected}
            >
              Send
            </button>
          </div>
          <div className="h-64 overflow-y-scroll rounded border p-4">
            <div ref={ref}></div>
            {[...(messages?.pages?.flat() || []), ...liveMessages]
              .reverse()
              .map((message, index) => (
                <p key={index} className="mb-2">
                  {message.content}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Channel
