import { CornerDownLeft, Settings, Triangle, Plus } from "lucide-react"
import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ConnectKitButton } from "connectkit"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { useLLM } from "@/hooks/use-llm"

export function Dashboard() {
  const [selectedModel, setSelectedModel] = useState<"llama" | "qwen2" | null>(null)
  const { sendMessage, isLoading } = useLLM(selectedModel)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [availableCredit, setAvailableCredit] = useState(100)
  const [creditToAdd, setCreditToAdd] = useState("")
  const [ethExchangeRate, setEthExchangeRate] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simulating fetching ETH exchange rate
    // In a real application, you would fetch this from an API
    setEthExchangeRate(2000) // 1 ETH = 2000 credits
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    await send()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const send = async () => {
    if (inputMessage.trim() && selectedModel) {
      const userMessage = { role: "user", content: inputMessage.trim() }
      setMessages(prev => [...prev, userMessage])
      setInputMessage("")
      
      try {
        const response = await sendMessage(userMessage.content)
        setMessages(prev => [...prev, { role: "assistant", content: response.content }])
      } catch (error) {
        console.error("Error sending message:", error)
        // Optionally, you can show an error message to the user here
      }
    }
  }

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(creditToAdd)
    if (!isNaN(amount) && amount > 0) {
      setAvailableCredit((prev) => prev + amount)
      setCreditToAdd("")
    }
  }

  const getCreditCharge = () => {
    switch (selectedModel) {
      case "llama":
        return 1
      case "qwen2":
        return 0.5
      default:
        return 0
    }
  }

  return (
    <div className="h-screen w-full pl-[56px] flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Triangle className="size-5 fill-foreground" />
          </Button>
        </div>
      </aside>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold">Playground</h1>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Credits: {availableCredit.toFixed(2)}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Credits</DialogTitle>
                    <DialogDescription>
                      Add credits to your account. Current exchange rate: 1 ETH
                      = {ethExchangeRate} credits
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCredit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-credit-dialog">
                        Amount (in credits)
                      </Label>
                      <Input
                        id="add-credit-dialog"
                        type="number"
                        placeholder="Amount"
                        value={creditToAdd}
                        onChange={(e) => setCreditToAdd(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Equivalent:{" "}
                      {creditToAdd
                        ? (parseFloat(creditToAdd) / ethExchangeRate).toFixed(6)
                        : "0"}{" "}
                      ETH
                    </div>
                    <Button type="submit">
                      <Plus className="size-4 mr-2" />
                      Add Credits
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <ConnectKitButton />
            </div>
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Settings className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-auto p-4 pt-0">
                <form className="grid w-full items-start gap-6">
                  <fieldset className="grid gap-6 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                      Settings
                    </legend>
                    <div className="grid gap-3">
                      <Label htmlFor="model-mobile">Model</Label>
                      <Select
                        onValueChange={(value: "llama" | "qwen2") =>
                          setSelectedModel(value)
                        }
                      >
                        <SelectTrigger
                          id="model-mobile"
                          className="items-start [&_[data-description]]:hidden"
                        >
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama">
                            <div className="flex items-start gap-3 text-muted-foreground">
                              <div className="grid gap-0.5">
                                <p>
                                  <span className="font-medium text-foreground">
                                    Llama 3.1
                                  </span>
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="qwen2">
                            <div className="flex items-start gap-3 text-muted-foreground">
                              <div className="grid gap-0.5">
                                <p>
                                  <span className="font-medium text-foreground">
                                    Qwen2
                                  </span>
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedModel && (
                      <div className="grid gap-3 p-3 border rounded-lg">
                        <p className="text-sm font-medium">
                          {selectedModel === "llama" ? "Llama 3.1" : "Qwen2"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedModel === "llama"
                            ? "Advanced language model"
                            : "Efficient and fast model"}
                        </p>
                        <p className="text-sm">
                          Credit charge: {getCreditCharge()} credits per message
                        </p>
                      </div>
                    )}
                  </fieldset>
                  {/* <fieldset className="grid gap-6 rounded-lg border p-4 mb-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                      Credits
                    </legend>
                    <div className="grid gap-3">
                      <Label>Available Credit</Label>
                      <p className="text-sm font-medium">
                        {availableCredit.toFixed(2)} credits
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="add-credit-mobile">Add Credit</Label>
                      <form onSubmit={handleAddCredit} className="grid gap-2">
                        <Input
                          id="add-credit-mobile"
                          type="number"
                          placeholder="Amount"
                          value={creditToAdd}
                          onChange={(e) => setCreditToAdd(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <Button size="sm">
                          <Plus className="size-4 mr-2" />
                          Add
                        </Button>
                      </form>
                    </div>
                  </fieldset> */}
                </form>
              </div>
            </DrawerContent>
          </Drawer>
          {/* <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button> */}
        </header>
        <main className="flex-1 overflow-hidden p-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex overflow-auto"
            x-chunk="dashboard-03-chunk-0"
          >
            <form className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Settings
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    onValueChange={(value: "llama" | "qwen2") =>
                      setSelectedModel(value)
                    }
                  >
                    <SelectTrigger
                      id="model"
                      className="items-start [&_[data-description]]:hidden"
                    >
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <div className="grid gap-0.5">
                            <p>
                              <span className="font-medium text-foreground">
                                Llama 3.1
                              </span>
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="qwen2">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <div className="grid gap-0.5">
                            <p>
                              <span className="font-medium text-foreground">
                                Qwen2
                              </span>
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedModel && (
                  <div className="grid gap-3 p-3 border rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedModel === "llama" ? "Llama 3.1" : "Qwen2"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedModel === "llama"
                        ? "Advanced language model"
                        : "Efficient and fast model"}
                    </p>
                    <p className="text-sm">
                      Credit charge: {getCreditCharge()} credits per message
                    </p>
                  </div>
                )}
              </fieldset>
              {/* <fieldset className="grid gap-6 rounded-lg border p-4 mb-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Credits
                </legend>
                <div className="grid gap-3">
                  <Label>Available Credit</Label>
                  <p className="text-sm font-medium">
                    {availableCredit.toFixed(2)} credits
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="add-credit">Add Credit</Label>
                  <form onSubmit={handleAddCredit} className="grid gap-2">
                    <Input
                      id="add-credit"
                      type="number"
                      placeholder="Amount"
                      value={creditToAdd}
                      onChange={(e) => setCreditToAdd(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <Button size="sm">
                      <Plus className="size-4 mr-2" />
                      Add
                    </Button>
                  </form>
                </div>
              </fieldset> */}
            </form>
          </div>
          <div className="relative flex h-full flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2 overflow-hidden">
            <div className="flex-1 overflow-auto mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {message.content}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="mb-4 text-left">
                  <span className="inline-block p-2 rounded-lg bg-muted">
                    ...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              x-chunk="dashboard-03-chunk-1"
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center p-3 pt-0">
                <Button type="submit" size="sm" className="ml-auto gap-1.5">
                  Send Message
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
