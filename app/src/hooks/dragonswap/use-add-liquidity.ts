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

type AddLiquidityParams = {
  token: Address
  amountTokenDesired: string
  amountTokenMin: string
  amountSEIDesired: string
  amountSEIMin: string
  to: Address
}

export function useAddLiquidity() {
  return useMutation({
    mutationFn: async ({
      token,
      amountTokenDesired,
      amountTokenMin,
      amountSEIDesired,
      amountSEIMin,
      to,
    }: AddLiquidityParams) => {
      const amountTokenDesiredBigInt = parseUnits(amountTokenDesired, 18)

      const approveResult = await writeContract(config, {
        address: token,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DRAGONSWAP_ROUTER_ADDRESS, amountTokenDesiredBigInt],
      })

      // wait for approval to be set
      await waitForTransactionReceipt(config, {
        hash: approveResult,
      })

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5) // 5 minutes from now

      // Add liquidity
      const result = await writeContract(config, {
        address: DRAGONSWAP_ROUTER_ADDRESS,
        abi: DRAGONSWAP_ROUTER_ABI,
        functionName: "addLiquiditySEI",
        args: [
          token,
          amountTokenDesiredBigInt,
          parseUnits(amountTokenMin, 18),
          parseUnits(amountSEIMin, 18),
          to,
          deadline,
        ],
        value: parseUnits(amountSEIDesired, 18), // Add the SEI value here
      })

      if (!result) throw new Error("Failed to add liquidity")

      return result
    },
    onError: (error: Error) => {
      console.error("Add liquidity error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (result) => {
      toast.success("Liquidity added successfully!")
      console.log("Add liquidity result:", result)
    },
  })
}
