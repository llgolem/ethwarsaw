import { useChainId } from "wagmi"
import { readContract } from "wagmi/actions"
import { CONTRACTS } from "@/lib/contracts"
import { config } from "@/lib/wagmi"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type UseNumberOptions = Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>

export function useNumber(options?: UseNumberOptions) {
  const chainId = useChainId()

  return useQuery<number, Error>({
    queryKey: ["number", chainId],
    queryFn: async () => {
      const contract = CONTRACTS[chainId]

      const result = await readContract(config, {
        address: contract.address,
        abi: contract.abi,
        functionName: "number",
        args: [],
      })

      if (typeof result !== 'number') throw new Error("Failed to get the number.")
      return result
    },
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    ...options,
  })
}
