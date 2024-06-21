// PodChannelList.tsx
import React from 'react'
import { GetPodchannelResult } from '@/shared/api/generated'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'

const PodChannelList: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const data = useLoaderData() as GetPodchannelResult

  return (
    <div className="mb-4">
      <h2 className="mb-2 text-xl font-semibold">Подканалы</h2>
      <div className="flex flex-wrap gap-2">
        {data?.map(podchannel => (
          <button
            key={podchannel.id}
            onClick={() => navigate(`/channel/${params.id}/${podchannel.id}`)}
            className={`rounded px-4 py-2 ${
              params.podID === String(podchannel.id)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {podchannel.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PodChannelList
