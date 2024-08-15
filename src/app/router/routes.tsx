import App from '@/pages/App'
import Channel from '@/pages/Channel'
import { getPodchannels } from '@/shared/api/generated'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Layout from './outlet'
import { PATH } from './path'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: PATH.HOME,
        element: <App />,
      },
      {
        path: PATH.CHANNEL,
        element: <Channel />,
        // loader: async ({ params }) => {
        //   const load = await getPodchannels({
        //     channelId: Number(params.channelID),
        //   })

        //   return load
        // },
      },
      // {
      //   path: PATH.PODCHANNEL,
      //   element: <PodChannel />,
      // },
    ],
  },
])

export default function Routes() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
