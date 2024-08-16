import { getPodchannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'
import { ScrollRestoration, useParams } from 'react-router-dom'

import Chat from '@/components/Chat'
import PodChannelList from '@/components/PodChannelList'

type Props = {}

export default function PodChannel({}: Props) {
  const { channelID, podchannelID } = useParams()

  const { data: podchannels } = useQuery({
    queryKey: ['podchannels', channelID],
    queryFn: () => getPodchannels({ channelId: Number(channelID) }),
    enabled: !!channelID,
  })
  return (
    <section className="flex h-[100vh] flex-grow pl-20">
      <ScrollRestoration
        getKey={(location, matches) => {
          return location.pathname
        }}
      />
      <PodChannelList data={podchannels} />
      <Chat />
    </section>
  )
}
