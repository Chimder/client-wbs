import React, { useEffect, useState } from 'react'
import { getPodchannelMessage } from '@/shared/api/generated'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

const Chat: React.FC = () => {
  const params = useParams()
  const { podchannelID } = useParams()
  const [inputValue, setInputValue] = useState('')
  const [liveMessages, setLiveMessages] = useState<
    { id: number; content: string; created_at: Date }[]
  >([])

  const fetchMessages = async ({ pageParam = 1 }) => {
    const response = await getPodchannelMessage({
      podchannel_id: Number(params.podchannelID),
      limit: 10,
      page: pageParam,
    })
    return response
  }

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', params.podchannelID],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) {
        return undefined
      }
      return pages.length + 1
    },
    // enabled: !!params.podchannelId,
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

  const allMessages = [
    ...(messages?.pages?.flat() || []),
    ...liveMessages,
  ].reverse()

  return (
    <div className="h-64 overflow-y-scroll rounded border p-4">
      {allMessages.map((message, index) => (
        <p key={index} className="mb-2">
          {message.content}
        </p>
      ))}
      <div ref={ref}></div>
    </div>
  )
}

export default Chat
