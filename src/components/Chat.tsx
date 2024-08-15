import React, { useContext, useEffect, useRef, useState } from 'react'
import { getPodchannelMessage } from '@/shared/api/generated'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { WebSocketContext } from '@/components/WebSocketProvider'

import { Skeleton } from './ui/skeleton'
import { Textarea } from './ui/textarea'

const Chat: React.FC = () => {
  const {
    socket,
    isConnected,
    sendMessage: sendWebSocketMessage,
    liveMessages,
  } = useContext(WebSocketContext)

  const { podchannelID, channelID } = useParams()
  const [inputValue, setInputValue] = useState<string>('')
  const chatContainerRef = useRef<HTMLUListElement>(null)
  const initialLoadRef = useRef(true)
  const key = `${channelID}-${podchannelID}`
  const currentLiveMessages = liveMessages[key] || []

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

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
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['messages', podchannelID],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage, pages, lastPageParam) => {
      if (!lastPage || lastPage.length < 9) {
        return undefined
      }
      return lastPageParam + 1
    },
    initialPageParam: 1,
    enabled: !!podchannelID,
    refetchOnWindowFocus: false,
    staleTime: 800000,
    retry: 0,
  })

  useEffect(() => {
    if (initialLoadRef.current && messages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom()
        initialLoadRef.current = false
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [messages])

  const { ref, inView } = useInView({ triggerOnce: false, skip: !hasNextPage })
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])

  const sendMessage = () => {
    if (socket && inputValue.trim() !== '' && podchannelID) {
      const message = JSON.stringify({
        event: 'message',
        message: inputValue,
        created_at: new Date().toISOString(),
        channel_id: Number(channelID),
        podchannel_id: Number(podchannelID),
      })
      sendWebSocketMessage(message)
      setInputValue('')
      setTimeout(() => {
        scrollToBottom()
      }, 300)
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const reversedMessages = messages ? messages.pages.flat().reverse() : []

  return (
    <div className="flex flex-grow flex-col justify-between overflow-y-hidden">
      <ul
        ref={chatContainerRef}
        className="h-[100vh] space-y-4 overflow-y-auto px-4 pb-4"
      >
        {isFetching && !isFetchingNextPage ? (
          Array.from({ length: 50 }, (_, index) => (
            <React.Fragment key={`skeleton-${index}`}>
              <div className="relative w-full rounded-sm">
                <div className="">
                  <Skeleton className="mb-2 bg-slate-300 p-8" />
                </div>
              </div>
            </React.Fragment>
          ))
        ) : reversedMessages && reversedMessages.length > 0 ? (
          reversedMessages.map((message, i) => (
            <li
              ref={ref}
              key={message?.id}
              className="mb-2 flex items-center justify-between bg-slate-600 p-4"
            >
              <p>{message?.message}</p>
              <span className="self-start text-xs text-gray-400">
                {new Date(message?.created_at!).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))
        ) : (
          <div>lox</div>
        )}
        {currentLiveMessages?.map((message, index) => (
          <div
            key={`live-${index}`}
            className="mb-2 flex items-center justify-between p-4"
          >
            <p>{message?.message}</p>
            <span className="self-start text-xs">
              {new Date(message?.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </ul>
      <div className="relative bottom-0 mx-8 ml-4 h-11 pb-20">
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter message"
          className="mb-2 mr-4 w-full rounded border p-2"
          style={{ resize: 'none', overflow: 'auto', minHeight: '40px' }}
        />
      </div>
    </div>
  )
}

export default Chat
