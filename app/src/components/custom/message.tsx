import { useRef, useEffect } from "react"

interface MessageListProps {
  messages: { role: string; content: string }[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-auto mb-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
        >
          <span
            className={`inline-block p-2 rounded-lg ${
              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {message.content}
          </span>
        </div>
      ))}
      {isLoading && (
        <div className="mb-4 text-left">
          <span className="inline-block p-2 rounded-lg bg-muted">...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
