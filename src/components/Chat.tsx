import React, { useContext, useEffect, useRef, useState } from 'react'
import { getPodchannelMessage } from '@/shared/api/generated'
import { useInfiniteQuery } from '@tanstack/react-query'
// import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { WebSocketContext } from '@/components/WebSocketProvider'

import { Skeleton } from './ui/skeleton'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const fetchMessages = async ({ pageParam = 1 }) => {
    const response = await getPodchannelMessage({
      podchannel_id: Number(podchannelID),
      limit: 20,
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
      if (!lastPage || lastPage.length < 19) {
        return undefined
      }
      return lastPageParam + 1
    },
    initialPageParam: 1,
    enabled: !!podchannelID,
    refetchOnWindowFocus: false,
    staleTime: 800000,
    retry: 0,
    select: data => {
      const allMessages = data.pages.flat()
      const liveMessagesForCurrentChannel = liveMessages[key] || []

      const mergedMessages = [
        ...allMessages,
        ...liveMessagesForCurrentChannel,
      ].sort(
        (a, b) =>
          new Date(a?.created_at!).getTime() -
          new Date(b?.created_at!).getTime(),
      )
      return mergedMessages
    },
  })

  useEffect(() => {
    if (initialLoadRef.current && messages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom()
        initialLoadRef.current = false
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [messages])

  const sendMessage = () => {
    if (socket && inputValue.trim() !== '' && podchannelID) {
      const message = JSON.stringify({
        event: 'message',
        message_id: uuidv4(),
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

  return (
    <div className="flex flex-grow flex-col justify-between overflow-y-hidden">
      {isFetching && !isFetchingNextPage ? (
        <div className="h-[100vh] space-y-4 overflow-y-auto px-4 pb-4">
          {Array.from({ length: 20 }, (_, index) => (
            <Skeleton
              key={`skeleton-${index}`}
              className="mb-2 bg-slate-300 p-8"
            />
          ))}
        </div>
      ) : (
        <>
          <ul
            ref={chatContainerRef}
            className="h-[100vh] space-y-4 overflow-y-auto px-4 pb-4"
          >
            {hasNextPage && (
              <div className="my-4 pt-1 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'load...' : 'load old'}
                </Button>
              </div>
            )}

            {messages?.map((message, i) => (
              <li
                key={`${message?.id}${message?.created_at}`}
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
            ))}
          </ul>
        </>
      )}
      <div className=" relative bottom-0 mb-20 pb-[8vh] pt-1 mx-8 ml-4 h-11 ">
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
