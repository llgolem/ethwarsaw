import { CONTRACTS } from "@/lib/contracts"
import { chainMap, config } from "@/lib/wagmi"
import { useMutation } from "@tanstack/react-query"
import { ISuccessResult } from "@worldcoin/idkit"
import { privateKeyToAccount } from "viem/accounts"
import { writeContract } from "@wagmi/core"
import { env } from "@/env.mjs"

export const useVerifyWithWorldcoin = () => {
  return useMutation({
    mutationFn: async ({
      proof,
      userAddress,
    }: {
      proof: ISuccessResult
      userAddress: string
    }) => {
      const response = await fetch("/api/verify-worldcoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proof, userAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.code ?? "Unknown error")
      }

      const res = await response.json()
      const nullifierHash = res.verifyRes.nullifier_hash

      const privateKey = env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY as `0x${string}`
      const account = privateKeyToAccount(privateKey)

      const results = await Promise.all(
        Object.entries(CONTRACTS).map(async ([chainId, contract]) => {
          const chain = chainMap[Number(chainId) as keyof typeof chainMap]

          if (!chain) {
            return { chainId, success: false, error: "Chain not found" }
          }

          try {
            const hash = await writeContract(config, {
              chainId: Number(chainId),
              address: contract.address,
              abi: contract.abi,
              functionName: "addBonusCredit",
              args: [userAddress, nullifierHash],
              account,
            })
            return { chainId, success: true, hash }
          } catch (error) {
            return { chainId, success: false, error: (error as Error).message }
          }
        })
      )

      console.log("Contract interaction results:", results)

      return response.json()
    },
    onSuccess: () => {
      console.log("Successfully verified credential.")
    },
    onError: (error) => {
      console.error("Error during verification:", error)
    },
  })
}
