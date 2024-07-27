'use client'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import config from "@/rikyRaidConfig.json"

const projectId = '1e9b23d2568da825ea32c519f7681ee1'

const base = {
  chainId: 8453,
  name: 'Base Mainnet',
  currency: 'ETH',
  explorerUrl: config.blockExplorer,
  rpcUrl: config.publicRpc
}

const baseSepolia = {
  chainId: 84532,
  name: 'Base Sepolia',
  currency: 'ETH',
  explorerUrl: config.blockExplorer,
  rpcUrl: config.publicRpc
}

const metadata = {
  name: "Riky Raid",
  description: "An onchain raid.",
  url: '',
  icons: ['']
}

const ethersConfig = defaultConfig({
  metadata,
  auth: {
    email: false, 
    socials: ['google', 'apple'],
    showWallets: true,
    walletFeatures: true
  },
  coinbasePreference: "all",
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true, 
  rpcUrl: '...',
  defaultChainId: 84532
})

createWeb3Modal({
  allWallets: 'HIDE',
  ethersConfig,
  chains: [[config.network]],
  projectId,
  enableAnalytics: true, 
  enableOnramp: true 
})

export function Web3Modal({ children }) {
  return children
}