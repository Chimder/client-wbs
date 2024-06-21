import React, { createContext, useEffect, useState } from 'react'

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: string) => void
  liveMessages: { content: string }[]
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
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [liveMessages, setLiveMessages] = useState<{ content: string }[]>([])

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')

    newSocket.onopen = () => {
      console.log('webs open')
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const message = JSON.parse(event.data)
      console.log('EVENT', message)

      if (message.event !== 'users') {
        setLiveMessages(prevMessages => [
          ...prevMessages,
          {
            content: message.data,
          },
        ])
      }
    }

    newSocket.onerror = error => {
      console.error('ERROR WebSocket:', error)
    }

    newSocket.onclose = () => {
      console.log('WEBSOC CLOSE')
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
      value={{ socket, isConnected, sendMessage, liveMessages }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
