import { toast } from "sonner"
import {
  writeContract,
  readContract,
  waitForTransactionReceipt,
} from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { useMutation } from "@tanstack/react-query"
import { Address, parseUnits } from "viem"
import {
  DRAGONSWAP_ROUTER_ADDRESS,
  DRAGONSWAP_ROUTER_ABI,
  ERC20_ABI,
} from "@/lib/constants"

type SwapParams = {
  amountIn: string
  amountOutMin?: string
  path: Address[]
  to: Address
  deadline: bigint
}

export function useSwap() {
  return useMutation({
    mutationFn: async ({
      amountIn,
      amountOutMin = "0",
      path,
      to,
      deadline,
    }: SwapParams) => {
      const tokenToSwap = path[0]

      // Check allowance
      const allowance = (await readContract(config, {
        address: tokenToSwap,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [to, DRAGONSWAP_ROUTER_ADDRESS],
      })) as bigint

      const amountInBigInt = parseUnits(amountIn, 18)

      // Approve if necessary
      if (allowance < amountInBigInt) {
        const approveResult = await writeContract(config, {
          address: tokenToSwap,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [DRAGONSWAP_ROUTER_ADDRESS, amountInBigInt],
        })

        // wait for approval to be set
        await waitForTransactionReceipt(config, {
          hash: approveResult,
        })

        if (!approveResult) throw new Error("Failed to approve token")
      }

      // Execute swap
      const result = await writeContract(config, {
        address: DRAGONSWAP_ROUTER_ADDRESS,
        abi: DRAGONSWAP_ROUTER_ABI,
        functionName: "swapExactTokensForSEI",
        args: [
          amountInBigInt,
          parseUnits(amountOutMin, 18),
          path,
          to,
          deadline,
        ],
      })

      if (!result) throw new Error("Failed to swap tokens")

      return result
    },
    onError: (error: Error) => {
      console.error("Swap error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (result) => {
      toast.success("Swap executed successfully!")
      console.log("Swap result:", result)
    },
  })
}
