"use client";

import React, { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { wagmiAdapter, projectId } from "@/lib/appkit"
import { createAppKit } from '@reown/appkit/react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { mainnet, arbitrum, base, scroll, polygon, optimism } from '@reown/appkit/networks'

// Set up queryClient
const queryClient = new QueryClient()


if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'danny-ryan',
  description: 'Vote Danny Ryan',
  url: 'https://votedannyryan.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const networks = [mainnet, arbitrum, base, scroll, polygon, optimism]

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  // @ts-ignore
  networks,
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function Providers({ children, cookies }: { children: React.ReactNode, cookies: string | null }) {

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
