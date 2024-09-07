import { toast } from "sonner"
import { writeContract, readContract } from "wagmi/actions"
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
      // Check allowance
      const allowance = (await readContract(config, {
        address: token,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [to, DRAGONSWAP_ROUTER_ADDRESS],
      })) as bigint

      const amountTokenDesiredBigInt = parseUnits(amountTokenDesired, 18)

      // Approve if necessary
      if (allowance < amountTokenDesiredBigInt) {
        const approveResult = await writeContract(config, {
          address: token,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [DRAGONSWAP_ROUTER_ADDRESS, amountTokenDesiredBigInt],
        })

        if (!approveResult) throw new Error("Failed to approve token")
      }

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

// const { addLiquiditySEI } = useAddLiquidity()

//   const testAddLiquidity = async (
//   ) => {
//     if (!address) {
//       console.error('No address found')
//       return
//     }

//     try {
//       const tokenAmount = '100'
//       const seiAmount = '0.1'

//       await addLiquiditySEI.mutateAsync({
//         token: SEI_GOLEM_TOKEN_ADDRESS,
//         amountTokenDesired: tokenAmount,
//         amountTokenMin: tokenAmount, // For simplicity, we're using the same amount for min
//         amountSEIDesired: seiAmount,
//         amountSEIMin: seiAmount, // For simplicity, we're using the same amount for min
//         to: address,
//       })

//       console.log('Liquidity added successfully')
//     } catch (error) {
//       console.error('Error adding liquidity:', error)
//     }
//   }
