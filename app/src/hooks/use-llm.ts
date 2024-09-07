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

    const systemPrompt = `You are a crypto transaction parser. Your task is to interpret user messages about crypto transactions and return a structured JSON response. Follow these guidelines:

1. Parse the input for transaction type, amount, token/currency, and recipient.
2. Return a JSON object with the following structure:
   {
     "action": "send" | "swap",
     "amount": number,
     "from": string (token/currency name for 'send', or token to swap from for 'swap'),
     "to": string (recipient address/ENS for 'send', or token to swap to for 'swap'),
     "recipient": string (only for 'send' actions)
   }
3. If any information is missing or unclear, use null for that field.
4. Do not include any explanations or additional text outside the JSON object.
5. Ensure the JSON is valid and properly formatted.`;

    setIsLoading(true);

    try {
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
    } catch (error) {
      console.error("LLM error:", error);
      return { role: "assistant", content: "Please select a model and try again." };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
