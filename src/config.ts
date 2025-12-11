import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { injected, mock } from 'wagmi/connectors'

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors: [
    injected(),
    mock({
        accounts: [
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat Account #0
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat Account #1
        ],
        features: {
            reconnect: true,
        },
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http(),
  },
})
