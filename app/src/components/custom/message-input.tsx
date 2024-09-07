import { useState } from "react"
import { CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  selectedModel: "llama" | "qwen2" | null
}

export default function MessageInput({ onSendMessage, selectedModel }: MessageInputProps) {
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    onSendMessage(inputMessage)
    setInputMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
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
        <Button
          type="submit"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={!selectedModel || !inputMessage}
        >
          Send Message
          <CornerDownLeft className="size-3.5" />
        </Button>
      </div>
    </form>
  )
}
