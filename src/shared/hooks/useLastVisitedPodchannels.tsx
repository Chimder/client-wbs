import { useEffect, useState } from 'react'

interface LastVisitedPodchannels {
  [channelId: string]: string
}

function useLastVisitedPodchannels() {
  const [lastVisitedPodchannels, setLastVisitedPodchannels] =
    useState<LastVisitedPodchannels>(() => {
      const saved = localStorage.getItem('lastVisitedPodchannels')
      return saved ? JSON.parse(saved) : {}
    })

  useEffect(() => {
    localStorage.setItem(
      'lastVisitedPodchannels',
      JSON.stringify(lastVisitedPodchannels),
    )
  }, [lastVisitedPodchannels])

  const updateLastVisitedPodchannel = (
    channelId: string,
    podchannelId: string,
  ) => {
    setLastVisitedPodchannels((prevState: LastVisitedPodchannels) => ({
      ...prevState,
      [channelId]: podchannelId,
    }))
  }

  return [lastVisitedPodchannels, updateLastVisitedPodchannel] as const
}

export default useLastVisitedPodchannels
