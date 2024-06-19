// WebSocketProvider.tsx
import React, { createContext, useEffect, useState } from 'react'

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: string) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
})

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000/ws')

    newSocket.onopen = () => {
      console.log('Подключено к серверу')
      setIsConnected(true)
    }

    newSocket.onmessage = event => {
      const message = JSON.parse(event.data)
      console.log('СОБЫТИЕ', message)
    }

    newSocket.onerror = error => {
      console.error('Ошибка WebSocket:', error)
    }

    newSocket.onclose = () => {
      console.log('Отключено от сервера')
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
    <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}
