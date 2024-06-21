import React, { useContext, useEffect, useRef, useState } from 'react'
import { getPodchannelMessage } from '@/shared/api/generated'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { WebSocketContext } from '@/components/WebSocketProvider'

import { Button } from './ui/button'

const Chat: React.FC = () => {
  const { podchannelID, channelID } = useParams()
  const [inputValue, setInputValue] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()
  const initialLoadRef = useRef(true)

  const {
    socket,
    isConnected,
    sendMessage: sendWebSocketMessage,
    liveMessages,
  } = useContext(WebSocketContext)

  const fetchMessages = async ({ pageParam = 1 }) => {
    const response = await getPodchannelMessage({
      podchannel_id: Number(podchannelID),
      limit: 10,
      page: pageParam,
    })
    return response
  }

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isRefetching,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['messages', podchannelID],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage, pages, lastPageParam) => {
      if (lastPage.length < 10) {
        return undefined
      }
      return lastPageParam + 1
    },
    initialPageParam: 1,
    enabled: !!podchannelID,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const sendJoinUser = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          event: 'join_podchannel',
          channel_id: Number(channelID),
          podchannel_id: Number(podchannelID),
        }),
      )
    }
  }

  const sendMessage = () => {
    if (socket && inputValue.trim() !== '' && podchannelID) {
      const message = JSON.stringify({
        event: 'message',
        data: inputValue,
        channel_id: Number(channelID),
        podchannel_id: Number(podchannelID),
      })
      sendWebSocketMessage(message)
      setInputValue('')
      setTimeout(() => {
        scrollToBottom()
      }, 200)
    }
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (initialLoadRef.current && messages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom()
        initialLoadRef.current = false
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [liveMessages])

  useEffect(() => {
    if (podchannelID && channelID) {
      sendJoinUser()
    }
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 200)
    return () => clearTimeout(timeoutId)
  }, [podchannelID, channelID])

  const reversedMessages = messages ? messages.pages.flat().reverse() : []

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      <div ref={chatContainerRef} className="h-[50vh] overflow-y-auto">
        {reversedMessages.map((message, i) => (
          <p
            ref={i === 9 ? ref : null}
            key={message.id}
            className="mb-2 bg-slate-600 p-4"
          >
            {message.content}
          </p>
        ))}
        {liveMessages.map((message, index) => (
          <p key={`live-${index}`} className="mb-2">
            {message.content}
          </p>
        ))}
      </div>
      <div ref={ref}></div>
      <div className="input-container fixed bottom-0 right-0 w-full px-4">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter message"
          className="mb-2 w-full rounded border p-2"
        />
        <Button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-800"
          disabled={!isConnected}
        >
          Send
        </Button>
      </div>
    </div>
  )
}

export default Chat
