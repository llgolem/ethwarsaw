import { useState } from "react"
import { useLLM } from "@/hooks/use-llm"
import { useSendValue } from "@/hooks/transaction/use-send"
import { useSendERC20 } from "@/hooks/transaction/use-send-erc20"
import { useSwap } from "@/hooks/dragonswap/use-swap"
import { useDeployToken } from "@/hooks/use-deploy-token"
import { useAddLiquidity } from "@/hooks/dragonswap/use-add-liquidity"
import DashboardHeader from "./header"
import ModelSelector from "./model-selector"
import MessageList from "./message"
import MessageInput from "./message-input"
import { Triangle } from "lucide-react"
import { Button } from "../ui/button"
import { useCheckCredits } from "@/hooks/credit-manager/use-check-credits"
import { useAccount } from "wagmi"
import { config } from "@/lib/wagmi"
import { SEI_NATIVE_TOKEN_ADDRESS } from "@/lib/constants"
import { useRemoveCredits } from "@/hooks/credit-manager/use-remove-credits"
import Logo from "../icons/logo"
import { useTheme } from "next-themes"

export function Dashboard() {
  const { theme, setTheme } = useTheme()

  const [selectedModel, setSelectedModel] = useState<"llama" | "qwen2">("llama")
  const { mutateAsync: sendMessage, isPending: isLoading } =
    useLLM(selectedModel)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const { data: availableCredit } = useCheckCredits()
  const { address } = useAccount()

  const sendValue = useSendValue()
  const sendERC20 = useSendERC20()
  const swap = useSwap()
  const deployToken = useDeployToken()
  const addLiquidity = useAddLiquidity()
  const removeCredits = useRemoveCredits()

  const handleSendMessage = async (inputMessage: string) => {
    if (!availableCredit) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You do not have enough credits to send this message.",
        },
      ])
      return
    }

    if (inputMessage.trim() && selectedModel) {
      const userMessage = { role: "user", content: inputMessage.trim() }
      setMessages((prev) => [...prev, userMessage])

      try {
        await removeCredits.mutateAsync({
          amount: 1,
        })

        const response = await sendMessage(userMessage.content)
        const parsedInstructions = JSON.parse(response.content)

        // Execute the transaction based on the type
        if (
          Array.isArray(parsedInstructions) &&
          parsedInstructions.length > 0
        ) {
          const instruction = parsedInstructions[0]
          const requiredChainId = getChainId(instruction.chain)

          // Add confirmation message
          const confirmationMessage = getConfirmationMessage(
            instruction,
            requiredChainId
          )
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: confirmationMessage },
          ])

          let txHash: string | undefined

          switch (instruction.type) {
            case "send_eth":
              txHash = await sendValue.mutateAsync({
                recipientAddress: instruction.to,
                amount: instruction.amount.toString(),
                chainId: requiredChainId,
              })
              break
            case "send_erc20":
              txHash = await sendERC20.mutateAsync({
                tokenAddress: instruction.tokenAddress,
                recipientAddress: instruction.to,
                amount: instruction.amount.toString(),
                chainId: requiredChainId,
              })
              break
            case "swap":
              txHash = await swap.mutateAsync({
                amountIn: instruction.amount.toString(),
                path: [instruction.fromToken, SEI_NATIVE_TOKEN_ADDRESS],
                to: address!,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
              })
              break
            case "deploy":
              const deployed = await deployToken.mutateAsync({
                name: instruction.name,
                symbol: instruction.symbol,
              })
              if (deployed) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: `Token deployed successfully at address ${deployed}`,
                  },
                ])
              }
              break
            case "deploy_and_add_liquidity":
              const deployedAddress = await deployToken.mutateAsync({
                name: instruction.name,
                symbol: instruction.symbol,
              })
              if (deployedAddress) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: `Token deployed successfully at address ${deployedAddress}`,
                  },
                ])
                txHash = await addLiquidity.mutateAsync({
                  token: deployedAddress,
                  amountTokenDesired: instruction.tokenAmount.toString(),
                  amountTokenMin: instruction.tokenAmount.toString(),
                  amountSEIDesired: instruction.nativeAmount.toString(),
                  amountSEIMin: instruction.nativeAmount.toString(),
                  to: address!,
                })
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: `Liquidity added successfully`,
                  },
                ])
              }
              break
            default:
              console.error("Unknown transaction type")
          }

          if (txHash) {
            const chainName =
              config.chains.find((chain) => chain.id === requiredChainId)
                ?.name || "Unknown"
            const txMessage = `Transaction completed successfully on ${chainName}. Transaction hash: \`${txHash}\``
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: txMessage },
            ])
          }
        }
      } catch (error) {
        console.error("Error processing message:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Error processing or executing the transaction instructions.",
          },
        ])
      }
    }
  }

  // Helper function to get chainId from chain name
  function getChainId(chainName: string): number {
    const chainMap: { [key: string]: number } = {
      sepolia: 11155111,
      mantle: 5003,
      zircuit: 48899,
      celo: 44787,
      sei: 1328,
    }

    // Convert input to lowercase for case-insensitive matching
    const lowercaseInput = chainName.toLowerCase()

    // Find the best match
    const bestMatch = Object.keys(chainMap).reduce((best, current) => {
      if (lowercaseInput.includes(current)) {
        if (!best || current.length > best.length) {
          return current
        }
      }
      return best
    }, "")

    if (bestMatch) {
      return chainMap[bestMatch]
    }

    // If no match found, try to find the chain in the wagmi config
    const configChain = config.chains.find((chain) =>
      chain.name.toLowerCase().includes(lowercaseInput)
    )

    if (configChain) {
      return configChain.id
    }

    // Default to mainnet if not found
    console.warn(`Chain "${chainName}" not found, defaulting to sei`)
    return 1328
  }

  // Helper function to get confirmation message
  function getConfirmationMessage(instruction: any, chainId: number): string {
    const chainName =
      config.chains.find((chain) => chain.id === chainId)?.name || "Unknown"

    switch (instruction.type) {
      case "send_eth":
        return `You are about to send ${instruction.amount} ETH to ${instruction.to} on the ${chainName} network. Please confirm this transaction in your wallet.`
      case "send_erc20":
        return `You are about to send ${instruction.amount} tokens from ${instruction.tokenAddress} to ${instruction.to} on the ${chainName} network. Please confirm this transaction in your wallet.`
      case "swap":
        return `You are about to swap ${instruction.amount} ${instruction.fromToken} for ${instruction.toToken} on the ${chainName} network. Please confirm this transaction in your wallet.`
      case "deploy":
        return `You are about to deploy a new token named "${instruction.name}" with symbol "${instruction.symbol}" on the ${chainName} network. Please confirm this transaction in your wallet.`
      case "deploy_and_add_liquidity":
        return `You are about to deploy a new token named "${instruction.name}" with symbol "${instruction.symbol}" and add liquidity (${instruction.tokenAmount} tokens and ${instruction.nativeAmount} ${chainName} native currency) on the ${chainName} network. Please confirm these transactions in your wallet.`
      default:
        return `You are about to execute a transaction on the ${chainName} network. Please confirm this transaction in your wallet.`
    }
  }

  return (
    <div className="h-screen w-full pl-[56px] flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Home"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Logo className="size-5 fill-foreground" />
          </Button>
        </div>{" "}
      </aside>
      <div className="flex flex-col h-full overflow-hidden">
        <DashboardHeader availableCredit={availableCredit ?? 0} />
        <main className="flex-1 overflow-hidden p-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
          <div className="relative flex h-full flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2 overflow-hidden">
            <MessageList messages={messages} isLoading={isLoading} />
            <MessageInput
              onSendMessage={handleSendMessage}
              selectedModel={selectedModel}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
