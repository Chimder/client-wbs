import App from '@/pages/App'
import Channel from '@/pages/Channel'
import PodChannel from '@/pages/PodChannel'
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'

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
      },
      {
        path: PATH.PODCHANNEL,
        element: <PodChannel />,
      },
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
