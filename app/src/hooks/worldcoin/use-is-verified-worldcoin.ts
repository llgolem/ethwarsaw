import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts"
import { chainMap, config } from "@/lib/wagmi"
import { readContract } from "@wagmi/core"
import { env } from "@/env.mjs"
import { privateKeyToAccount } from "viem/accounts";

export const useIsVerifiedWithWorldcoin = () => {
  const { address } = useAccount();

  return useQuery<boolean>({
    queryKey: ["isVerified", address],
    queryFn: async () => {
      const privateKey = env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY as `0x${string}`
      const account = privateKeyToAccount(privateKey)

      const results = await Promise.all(
        Object.entries(CONTRACTS).map(async ([chainId, contract]) => {
          const chain = chainMap[Number(chainId) as keyof typeof chainMap]

          if (!chain) {
            return { chainId, success: false, error: "Chain not found" }
          }

          try {
            const hasRedeemedBonus = await readContract(config, {
              chainId: Number(chainId),
              address: contract.address,
              abi: contract.abi,
              functionName: "hasUserRedeemedBonus",
              args: [address],
              account,
            })

            return { chainId, success: true, hasRedeemedBonus }
          } catch (error) {
            return { chainId, success: false, error: (error as Error).message }
          }
        })
      )

      return results.some((result) => result.success && result.hasRedeemedBonus)
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true,
    enabled: !!address,
  });
};
