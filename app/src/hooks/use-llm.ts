import { useState } from 'react';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
}

interface ChatCompletionResponse {
  choices: { message: ChatMessage }[];
}

export function useLLM(selectedModel: "llama" | "qwen2" | null) {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string): Promise<ChatMessage> => {
    if (!selectedModel) {
      throw new Error("No model selected");
    }

    const modelMap = {
      llama: "llama3.1",
      qwen2: "qwen2:0.5b",
    };

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:11111/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelMap[selectedModel],
          messages: [{ role: "user", content: message }],
        } as ChatCompletionRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to get LLM response");
      }

      const data: ChatCompletionResponse = await response.json();
      return data.choices[0].message;
    } catch (error) {
      console.error("LLM error:", error);
      return { role: "assistant", content: "Please select a model and try again." };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
