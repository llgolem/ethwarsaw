import { toast } from "sonner"
import { useChainId } from "wagmi"
import { writeContract } from "wagmi/actions"
import { config } from "@/lib/wagmi"
import { useMutation } from "@tanstack/react-query"
import { CONTRACTS } from "@/lib/contracts"

export function useSetNumber() {
  const chainId = useChainId()
  const contract = CONTRACTS[chainId]

  const setNumberMutation = useMutation({
    mutationFn: async ({ num }: { num: number }) => {
      const result = await writeContract(config, {
        address: contract.address,
        abi: contract.abi,
        functionName: "setNumber",
        args: [num],
      })

      if (!result) throw new Error("Failed to set number")

      return result
    },
    onError: (error: Error) => {
      console.error("Set number error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (result) => {
      toast.success("Number set successfully!")
      console.log("Number set successfully:", result)
    },
  })

  return setNumberMutation
}
