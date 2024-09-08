import { createConfig, http } from "wagmi"
import { sepolia, mantleSepoliaTestnet, zircuitTestnet, celoAlfajores, seiTestnet } from "wagmi/chains"
import { getDefaultConfig } from "connectkit"
import { env } from "@/env.mjs"

export const chainMap = {
  [celoAlfajores.id]: celoAlfajores,
  [mantleSepoliaTestnet.id]: mantleSepoliaTestnet,
  [zircuitTestnet.id]: zircuitTestnet,
}

export const config = createConfig(
  getDefaultConfig({
    chains: [sepolia, seiTestnet, mantleSepoliaTestnet, zircuitTestnet, celoAlfajores],
    transports: {
      [seiTestnet.id]: http(),
      [mantleSepoliaTestnet.id]: http(),
      [zircuitTestnet.id]: http(),
      [celoAlfajores.id]: http(),
    },
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    appName: "_wallm",
    appDescription: "An LLM-powered chat to simplify your wallet interactions with a unique credit system.",
  })
)

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
