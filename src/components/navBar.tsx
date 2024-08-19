import { getChannels } from '@/shared/api/generated'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'

export default function NavBar() {
  const navigate = useNavigate()
  const { channelID } = useParams()
  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels(),
    initialData: [],
  })

  return (
    <nav className="w-22 absolute h-screen items-center justify-center bg-gray-800 text-white">
      <ul className="flex flex-col items-center gap-4">
        {/* <div className="">LOGO</div> */}
        {isLoading ? (
          <Skeleton className="flex h-screen w-20 animate-pulse flex-col items-center bg-slate-700 duration-700" />
        ) : (
          channels &&
          channels?.map(channel => (
            <Link key={channel.id} to={`/channel/${channel.id}`}>
              <li className="" key={channel?.id}>
                <Button
                  className={`rounded-full px-4 py-2 ${channelID == channel.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {channel.name}
                </Button>
              </li>
            </Link>
          ))
        )}
      </ul>
      {/* <div className="mt-auto items-end">add</div> */}
    </nav>
  )
}
