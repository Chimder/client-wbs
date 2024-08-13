import React, { createContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export type WebsocketMessage = {
  id: number
  event: string
  author_id: string
  message: string
  created_at: string
  podchannel_id: number
  updated_at: string
}

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: string) => void
  liveMessages: WebsocketMessage[]
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  liveMessages: [],
})

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useParams()

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [liveMessages, setLiveMessages] = useState<WebsocketMessage[]>([])

  useEffect(() => {
    console.log('RELLLod')
    setLiveMessages([])
  }, [params.channelID, params.podchannelID])

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')
    newSocket.onopen = () => {
      console.log('WebSocket open')
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const data: WebsocketMessage = JSON.parse(event.data)
      console.log('EVENT', data)

      if (data.event == 'message') {
        setLiveMessages(prevMessages => {
          const newMessages = [...prevMessages, data]
          return newMessages
        })
      }
    }

    newSocket.onerror = error => {
      console.error('ERROR WebSocket:', error)
    }

    newSocket.onclose = () => {
      console.log('WebSocket closed')
      setIsConnected(false)
    }

    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [])

  const sendMessage = (message: string) => {
    if (socket) {
      socket.send(message)
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        liveMessages,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
