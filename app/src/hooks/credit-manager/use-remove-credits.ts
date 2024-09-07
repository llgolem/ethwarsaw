import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { chainMap, config } from "@/lib/wagmi";
import { writeContract } from "@wagmi/core";
import { env } from "@/env.mjs";
import { privateKeyToAccount } from "viem/accounts";

interface RemoveCreditsParams {
  amount: number;
}

export const useRemoveCredits = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: RemoveCreditsParams) => {
      if (!address) throw new Error("No wallet connected");

      const privateKey = env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey);

      const results = await Promise.all(
        Object.entries(CONTRACTS).map(async ([chainId, contract]) => {
          const chain = chainMap[Number(chainId) as keyof typeof chainMap];

          if (!chain) {
            return { chainId, success: false, error: "Chain not found" };
          }

          try {
            const hash = await writeContract(config, {
              chainId: Number(chainId),
              address: contract.address,
              abi: contract.abi,
              functionName: "removeCredits",
              args: [address, amount],
              account,
            });

            return { chainId, success: true, hash };
          } catch (error) {
            console.error("Error removing credits on chain", chainId, error);
            return { chainId, success: false, error: (error as Error).message };
          }
        })
      );

      const successfulTransactions = results.filter((result) => result.success);
      if (successfulTransactions.length === 0) {
        throw new Error("Failed to remove credits on all chains");
      }

      console.log("Successful transactions:", successfulTransactions);

      return successfulTransactions;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["credits", address] });
    },
  });
};
