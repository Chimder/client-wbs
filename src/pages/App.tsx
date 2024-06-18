import React, { useEffect, useState } from 'react'
import { getChannels, getPodchannel } from '@/shared/api/generated'
import { useMutation, useQuery } from '@tanstack/react-query'

const App = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [inputValue, setInputValue] = useState<string>('')

  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [selectedPodchannel, setSelectedPodchannel] = useState<number | null>(
    null,
  )

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels(),
    initialData: [],
  })

  const {
    mutate: getpodchannels,
    data: podchannels,
    isPending: podchannelsPending,
  } = useMutation({
    mutationKey: ['get-podchannels'],
    mutationFn: ({ id }: { id: number }) => getPodchannel({ channelId: id }),
  })

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')

    newSocket.onopen = () => {
      console.log('Connected to server')
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const message = JSON.parse(event.data)
      let displayMessage = ''
      console.log('EVENT', message)

      if (message.event === 'user_list') {
        displayMessage = `User connected: ${message.data.connected_users}`
      } else {
        displayMessage = `User: ${message.data}`
      }

      setMessages(prevMessages => [...prevMessages, displayMessage])
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

  const handleChannelClick = (channelId?: number) => {
    if (!channelId) {
      console.error('Channel ID is undefined')
      return
    }

    setSelectedChannel(channelId)
    setSelectedPodchannel(null)
    getpodchannels({ id: channelId })
  }

  const handlePodchannelClick = (podchannelId: number) => {
    setSelectedPodchannel(podchannelId)
  }

  const sendMessage = () => {
    if (socket && inputValue.trim() !== '' && selectedPodchannel) {
      const message = JSON.stringify({
        event: 'mess',
        data: inputValue,
      })
      socket.send(message)
      setInputValue('')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">WebSocket Communication</h1>
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
      {selectedChannel && (
        <div className="mb-4">
          {podchannelsPending ? (
            <p>Loading podchannels...</p>
          ) : (
            <div>
              <h2 className="mb-2 text-xl font-semibold">Podchannels</h2>
              <div className="flex flex-wrap gap-2">
                {podchannels?.map((podchannel: any) => (
                  <button
                    key={podchannel.id}
                    onClick={() => handlePodchannelClick(podchannel.id)}
                    className={`rounded px-4 py-2 ${selectedPodchannel === podchannel.id ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    {podchannel.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {selectedPodchannel && (
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
            {messages.map((message, index) => (
              <p key={index} className="mb-2">
                {message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
