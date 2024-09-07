import { useMutation } from "@tanstack/react-query"
import { sendTransaction } from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { Address, parseEther } from "viem"
import { toast } from "sonner"

type SendValueParams = {
  recipientAddress: Address
  amount: string
  chainId: number
}

export function useSendValue() {
  return useMutation({
    mutationFn: async ({ recipientAddress, amount, chainId }: SendValueParams) => {
      const result = await sendTransaction(config, {
        to: recipientAddress,
        value: parseEther(amount),
        chainId: chainId,
      })

      if (!result) throw new Error("Failed to send value")

      return result
    },
    onError: (error: Error) => {
      console.error("Send value error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (result) => {
      toast.success("Value sent successfully!")
      console.log("Send value result:", result)
    },
  })
}
