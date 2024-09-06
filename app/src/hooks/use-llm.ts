import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
}

interface ChatCompletionResponse {
  // Add the expected response structure here
  // This is a placeholder and should be updated based on the actual API response
  choices: { message: ChatMessage }[];
}

export function useLLM() {
  return useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("http://localhost:11111/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen2:0.5b",
          messages: [{ role: "user", content: message }],
        } as ChatCompletionRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to get LLM response");
      }

      return response.json() as Promise<ChatCompletionResponse>;
    },
    onError: (error: Error) => {
      console.error("LLM error:", error);
      toast.error(error.message);
    },
    onSuccess: (data) => {
      console.log("LLM response received:", data);
      // You can add additional success handling here if needed
    },
  });
}
