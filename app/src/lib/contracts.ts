import { Abi } from "viem"
import { celoAlfajores, mantleSepoliaTestnet, sepolia, optimismSepolia, zircuitTestnet } from "wagmi/chains"
import { ABI } from "./abi"

export const CONTRACTS: Record<number, { address: `0x${string}`; abi: Abi }> = {
  [optimismSepolia.id]: {
    address: "0xebd91ff2917706111a7958fd4c869009d55afebb",
    abi: ABI,
  },
  [celoAlfajores.id]: {
    address: "0x3697d1d2acf36d978281740bb2629bf7a42ee7df",
    abi: ABI,
  },
  [mantleSepoliaTestnet.id]: {
    address: "0x19db880df5ef9da6c8d4afd81a998eeb632b6115",
    abi: ABI,
  },
  [zircuitTestnet.id]: {
    address: "0x19db880df5ef9da6c8d4afd81a998eeb632b6115",
    abi: ABI,
  },
}
