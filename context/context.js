'use client'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import config from "@/rikyRaidConfig.json"

const projectId = '1e9b23d2568da825ea32c519f7681ee1'

const defaultChain = {
  chainId: config.chainId,
  name: config.chainName,
  currency: 'ETH',
  explorerUrl: config.explorer,
  rpcUrl: config.rpc
}

const metadata = {
  name: "Riky Raid",
  description: "An onchain raid.",
  url: 'https://app.rikytheraccoon.xyz',
  icons: ['https://rikytheraccoon.xyz/Riky_files/logo.png']
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true, 
  enableInjected: true, 
  enableCoinbase: true,
  rpcUrl: '...',
  defaultChainId: config.chainId,
  auth: {
    email: false,
    socials: [],
    showWallets: true,
    walletFeatures: true 
  },
  coinbasePreference: 'all'
})

createWeb3Modal({
  ethersConfig,
  chains: [defaultChain],
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  allWallets:"SHOW"
})

export function Web3Modal({ children }) {
  return children
}