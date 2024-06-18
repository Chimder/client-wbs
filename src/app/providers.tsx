import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from '@/components/theme-provider'

export const queryClient = new QueryClient()
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default Providers
