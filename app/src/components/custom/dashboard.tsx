import { useState, useEffect } from "react"
import { useLLM } from "@/hooks/use-llm"
import DashboardHeader from "./header"
import ModelSelector from "./model-selector"
import MessageList from "./message"
import MessageInput from "./message-input"
import { Triangle } from "lucide-react"
import { Button } from "../ui/button"

export function Dashboard() {
  const [selectedModel, setSelectedModel] = useState<"llama" | "qwen2" | null>(
    null
  )
  const { sendMessage, isLoading } = useLLM(selectedModel)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const [availableCredit, setAvailableCredit] = useState(100)
  const [ethExchangeRate, setEthExchangeRate] = useState(0)

  useEffect(() => {
    // Simulating fetching ETH exchange rate
    setEthExchangeRate(2000) // 1 ETH = 2000 credits
  }, [])

  const handleSendMessage = async (inputMessage: string) => {
    if (inputMessage.trim() && selectedModel) {
      const userMessage = { role: "user", content: inputMessage.trim() }
      setMessages((prev) => [...prev, userMessage])

      try {
        const response = await sendMessage(userMessage.content)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.content },
        ])
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  const handleAddCredit = (amount: number) => {
    if (!isNaN(amount) && amount > 0) {
      setAvailableCredit((prev) => prev + amount)
    }
  }

  return (
    <div className="h-screen w-full pl-[56px] flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Triangle className="size-5 fill-foreground" />
          </Button>
        </div>{" "}
      </aside>
      <div className="flex flex-col h-full overflow-hidden">
        <DashboardHeader
          availableCredit={availableCredit}
          ethExchangeRate={ethExchangeRate}
          onAddCredit={handleAddCredit}
        />
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
