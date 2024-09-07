import { toast } from "sonner"
import { useAccount, useWalletClient } from "wagmi"
import { useMutation } from "@tanstack/react-query"
import { parseAbi, createPublicClient, http } from "viem"
import { config } from "@/lib/wagmi"
import { TOKEN_BYTECODE } from "@/lib/bytecode"

const TOKEN_ABI = parseAbi([
  "constructor(string name, string symbol)",
])

type DeployTokenParams = {
  name: string
  symbol: string
}

export function useDeployToken() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    mutationFn: async ({ name, symbol }: DeployTokenParams) => {
      if (!address) throw new Error("No wallet connected")
      if (!walletClient) throw new Error("Wallet client not available")

      const publicClient = createPublicClient({
        chain: config.chains[1],
        transport: http(),
      })

      const hash = await walletClient.deployContract({
        abi: TOKEN_ABI,
        bytecode: TOKEN_BYTECODE,
        account: address,
        args: [name, symbol],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      return receipt.contractAddress
    },
    onError: (error: Error) => {
      console.error("Deploy token error:", error)
      if (error.message.includes("User rejected the request"))
        return toast.error("User denied transaction signature.")
      toast.error(error.message)
    },
    onSuccess: (contractAddress) => {
      toast.success(`Token deployed successfully at ${contractAddress}`)
      console.log("Deployed token address:", contractAddress)
    },
  })
}
