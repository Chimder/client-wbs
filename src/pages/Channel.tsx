// Channel.tsx
import React from 'react'
import { getPodchannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'
import { ScrollRestoration, useParams } from 'react-router-dom'

import Chat from '@/components/Chat'
import NavBar from '@/components/navBar'
import PodChannelList from '@/components/PodChannelList'

const Channel: React.FC = () => {
  const { channelID } = useParams()
  const { data } = useQuery({
    queryKey: [''],
    queryFn: () =>
      getPodchannels({
        channelId: Number(channelID),
      }),
  })
  console.log('CAACACAc', data)
  return (
    <section className="flex h-[100vh] flex-grow pl-20">
      <ScrollRestoration
        getKey={(location, matches) => {
          if (location.pathname.startsWith('/channels/')) {
            return location.pathname
          }
          return location.key
        }}
      />
      <PodChannelList data={data} />
      <Chat />
    </section>
  )
}

export default Channel
