import { toast } from "sonner"
import { writeContract } from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { useMutation } from "@tanstack/react-query"
import { Address, parseUnits } from "viem"
import { DRAGONSWAP_ROUTER_ADDRESS, DRAGONSWAP_ROUTER_ABI } from "@/lib/constants"

type SwapParams = {
  amountIn: string
  amountOutMin: string
  path: Address[]
  to: Address
  deadline: bigint
}

export function useSwap() {
  return useMutation({
    mutationFn: async ({ amountIn, amountOutMin, path, to, deadline }: SwapParams) => {
      const result = await writeContract(config, {
        address: DRAGONSWAP_ROUTER_ADDRESS,
        abi: DRAGONSWAP_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [
          parseUnits(amountIn, 18),
          parseUnits(amountOutMin, 18),
          path,
          to,
          deadline
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
