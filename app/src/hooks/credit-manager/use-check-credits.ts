import { useAccount } from "wagmi"
import { readContract } from "@wagmi/core"
import { CONTRACTS } from "@/lib/contracts"
import { config, chainMap } from "@/lib/wagmi"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type UseCheckCreditsOptions = Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>

export function useCheckCredits(options?: UseCheckCreditsOptions) {
  const { address } = useAccount()

  return useQuery<number, Error>({
    queryKey: ["credits", address],
    queryFn: async () => {
      const results = await Promise.all(
        Object.entries(CONTRACTS).map(async ([chainId, contract]) => {
          const chain = chainMap[Number(chainId) as keyof typeof chainMap]

          if (!chain) {
            return { chainId, credits: 0 }
          }

          try {
            const credits = await readContract(config, {
              chainId: Number(chainId),
              address: contract.address,
              abi: contract.abi,
              functionName: "getCredit",
              args: [address],
            })

            return { chainId, credits: Number(credits) }
          } catch (error) {
            console.error(`Error fetching credits for chain ${chainId}:`, error)
            return { chainId, credits: 0 }
          }
        })
      )

      const creditCounts = results.reduce((acc, result) => {
        acc[result.credits] = (acc[result.credits] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      const mostCommonCredit = Object.entries(creditCounts).reduce(
        (a, b) => (b[1] > a[1] ? b : a)
      )[0]

      return Number(mostCommonCredit)
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true,
    enabled: !!address,
    ...options,
  })
}
