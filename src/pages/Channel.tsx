import { getPodchannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'
import { ScrollRestoration, useParams } from 'react-router-dom'

import PodChannelList from '@/components/PodChannelList'

export default function Channel() {
  const { channelID } = useParams()

  const { data: podchannels } = useQuery({
    queryKey: ['podchannels', channelID],
    queryFn: () => getPodchannels({ channelId: Number(channelID) }),
    enabled: !!channelID,
    staleTime: 80000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  return (
    <section className="flex h-[100vh] flex-grow pl-20">
      <PodChannelList data={podchannels} />
      <div>WELCOME</div>
    </section>
  )
}
