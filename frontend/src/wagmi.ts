import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'One Post Daily',
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2/SRtSnNb7fiMWCFojDi_2y63y3H5YNz1X'),
  },
})
