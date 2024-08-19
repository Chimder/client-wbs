import React, { createContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export type WebsocketMessage = {
  id:string
  event: string
  author_id: string
  channel_id: string
  message: string
  created_at: string
  podchannel_id: number
}

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: string) => void
  liveMessages: { [key: string]: WebsocketMessage[] }
  sendJoinUser: (channelID: string) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  liveMessages: {},
  sendJoinUser: () => {},
})

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { podchannelID, channelID } = useParams()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [liveMessages, setLiveMessages] = useState<{
    [key: string]: WebsocketMessage[]
  }>({})

  console.log('LIve', liveMessages)
  useEffect(() => {
    const key = `${channelID}-${podchannelID}`
    if (!liveMessages[key]) {
      setLiveMessages(prev => ({ ...prev, [key]: [] }))
    }
  }, [channelID, podchannelID])

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')
    newSocket.onopen = () => {
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const data: WebsocketMessage = JSON.parse(event.data)
      const key = `${data.channel_id}-${data.podchannel_id}`
      console.log('>>>>>>', data)

      if (data.event === 'message') {
        setLiveMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), data],
        }))
      }
    }

    newSocket.onerror = error => {
      console.error('ERROR WebSocket:', error)
    }

    newSocket.onclose = () => {
      setIsConnected(false)
    }

    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [])

  const sendJoinUser = (channelID: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          event: 'join_podchannel',
          channel_id: Number(channelID),
          // podchannel_id: Number(podchannelID),
        }),
      )
    }
  }

  const sendMessage = (message: string) => {
    if (socket) {
      socket.send(message)
    }
  }

  return (
    <WebSocketContext.Provider
      value={{ socket, isConnected, sendMessage, liveMessages, sendJoinUser }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
