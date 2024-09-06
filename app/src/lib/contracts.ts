import { Abi } from "viem"
import { sepolia } from "wagmi/chains"
import { ABI } from "./abi"

export const CONTRACTS: Record<number, { address: `0x${string}`; abi: Abi }> = {
  [sepolia.id]: {
    address: "0x0000000000000000000000000000000000000000",
    abi: ABI,
  },
}
