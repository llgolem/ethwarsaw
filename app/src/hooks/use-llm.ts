import { useMutation } from '@tanstack/react-query';

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
  return useMutation({
    mutationFn: async (message: string): Promise<ChatMessage> => {
      if (!selectedModel) {
        throw new Error("No model selected");
      }

      const modelMap = {
        llama: "llama3.1",
        qwen2: "qwen2:0.5b",
      };

      const systemPrompt = `You are a crypto transaction parser. Your task is to interpret user messages about crypto transactions and return a structured JSON response. Follow these guidelines:

      // ... (rest of the system prompt remains unchanged)
      `;

      const response = await fetch("http://localhost:11111/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelMap[selectedModel],
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
        } as ChatCompletionRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to get LLM response");
      }

      const data: ChatCompletionResponse = await response.json();
      return data.choices[0].message;
    },
    onError: (error: Error) => {
      console.error("LLM error:", error);
    },
  });
}
