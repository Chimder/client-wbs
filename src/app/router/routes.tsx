import { lazy } from 'react'
// import { getEmotes, getTopGames, getUserById, getUserClips } from '@/shared/api/twitchApi/axios'
// import { ProtectedSign } from '@/shared/features/auth/protectedSign'
import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from 'react-router-dom'

import Layout from './outlet'
// import ReqResPassword from '@/components/auth/reqResPass'
// import ResetPassword from '@/components/auth/resetPassword'
// import SignIn from '@/components/auth/sign-in'
// import SignUp from '@/components/auth/sign-up'
// import Layout from '@/app/routes/layout'
import { PATH } from './path'

// const Home = lazy(() => import('@/pages/home'))
// const Steamer = lazy(() => import('@/pages/streamer'))

export default function Routes() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: PATH.HOME,
          // element: <Home />,
          // loader: async () => {
          // const load = await getTopGames()
          // return load
          // },
        },
        {
          path: PATH.STREAMER,
          element: <Steamer />,
          loader: async ({ params }) => {
            const [user, emotes] = await Promise.all([
              getUserById(params?.id),
              getEmotes(params?.id),
            ])
            return { user, emotes }
          },
        },
        {
          path: PATH.SIGNUP,
          // element: (
          // <ProtectedSign>
          //   <SignUp />
          // </ProtectedSign>
          // ),
        },
        {
          path: PATH.SIGNIN,
          // element: (
          //   <ProtectedSign>
          //     <SignIn />
          //   </ProtectedSign>
          // ),
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}
