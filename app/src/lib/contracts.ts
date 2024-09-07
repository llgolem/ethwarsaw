import { Abi } from "viem"
import { celoAlfajores, mantleSepoliaTestnet, sepolia, optimismSepolia, zircuitTestnet } from "wagmi/chains"
import { ABI } from "./abi"

export const CONTRACTS: Record<number, { address: `0x${string}`; abi: Abi }> = {
  [optimismSepolia.id]: {
    address: "0x5b82122cf33ab680c779a2b5d606776e607fa5e5",
    abi: ABI,
  },
  [celoAlfajores.id]: {
    address: "0x5b82122cf33ab680c779a2b5d606776e607fa5e5",
    abi: ABI,
  },
  [mantleSepoliaTestnet.id]: {
    address: "0x37a28446d9952ac66d9f42f44fac47e704b6c95f",
    abi: ABI,
  },
  [zircuitTestnet.id]: {
    address: "0x37a28446d9952ac66d9f42f44fac47e704b6c95f",
    abi: ABI,
  },
}
