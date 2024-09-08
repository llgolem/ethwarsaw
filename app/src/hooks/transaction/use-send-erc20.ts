import { useMutation } from "@tanstack/react-query"
import { writeContract } from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { Address, parseUnits } from "viem"
import { toast } from "sonner"
import { ERC20_ABI } from "@/lib/abi"

type SendERC20Params = {
  tokenAddress: Address
  recipientAddress: Address
  amount: string
  chainId: number
}

export function useSendERC20() {
  return useMutation({
    mutationFn: async ({ tokenAddress, recipientAddress, amount, chainId }: SendERC20Params) => {
      const result = await writeContract(config, {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipientAddress, parseUnits(amount, 18)],
        chainId: chainId,
      })

      if (!result) throw new Error("Failed to send ERC20 token")

      return result
    },
    onError: (error: Error) => {
      console.error("Send ERC20 error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (result) => {
      toast.success("ERC20 token sent successfully!")
      console.log("Send ERC20 result:", result)
    },
  })
}
