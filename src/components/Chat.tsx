import React, { useContext, useEffect, useRef, useState } from 'react'
import { getPodchannelMessage } from '@/shared/api/generated'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { WebSocketContext } from '@/components/WebSocketProvider'

import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'

const Chat: React.FC = () => {
  const {
    socket,
    isConnected,
    sendMessage: sendWebSocketMessage,
    liveMessages,
  } = useContext(WebSocketContext)

  const { podchannelID, channelID } = useParams()
  const [inputValue, setInputValue] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const initialLoadRef = useRef(true)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }
  // useEffect(() => {
  //   scrollToBottom()
  // }, [liveMessages])

  useEffect(() => {
    if (podchannelID && channelID) {
      sendJoinUser()
    }
    // scrollToBottom()
  }, [podchannelID, channelID])

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
    // select(data) {
    //   console.log('>>>>', data)
    // },
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
        message: inputValue,
        created_at: new Date().toISOString(),
        channel_id: Number(channelID),
        podchannel_id: Number(podchannelID),
      })
      sendWebSocketMessage(message)
      setInputValue('')
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }

  const reversedMessages = messages ? messages.pages.flat().reverse() : []

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      <div ref={chatContainerRef} className="h-[50vh] overflow-y-auto">
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
            <div
              ref={ref}
              key={message?.id}
              className="mb-2 flex items-center justify-between bg-slate-600 p-4"
            >
              <p>{message?.content}</p>
              <span className="self-start text-xs text-gray-400">
                {new Date(message?.created_at!).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        ) : (
          <div>lox</div>
        )}
        {liveMessages.map((message, index) => (
          <div
            key={`live-${index}`}
            className="mb-2 flex items-center justify-between bg-slate-600 p-4"
          >
            <p>{message?.message}</p>
            <span className="self-start text-xs text-gray-400">
              {new Date(message?.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
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
