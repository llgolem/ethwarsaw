import { createConfig, http } from "wagmi"
import { sepolia, mantleSepoliaTestnet, zircuitTestnet, celoAlfajores, optimismSepolia } from "wagmi/chains"
import { getDefaultConfig } from "connectkit"
import { env } from "@/env.mjs"

export const config = createConfig(
  getDefaultConfig({
    chains: [sepolia, mantleSepoliaTestnet, zircuitTestnet, celoAlfajores, optimismSepolia],
    transports: {
      [mantleSepoliaTestnet.id]: http(),
      [zircuitTestnet.id]: http(),
      [celoAlfajores.id]: http(),
      [optimismSepolia.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
)

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
