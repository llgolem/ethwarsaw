import { useMutation } from "@tanstack/react-query"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
}

interface ChatCompletionResponse {
  choices: { message: ChatMessage }[]
}

export function useLLM(selectedModel: "llama" | "qwen2" | null) {
  return useMutation({
    mutationFn: async (message: string): Promise<ChatMessage> => {
      if (!selectedModel) {
        throw new Error("No model selected")
      }

      const modelMap = {
        llama: "llama3.1",
        qwen2: "qwen2:0.5b",
      }

      const systemPrompt = `You are a crypto transaction parser. Your task is to interpret user messages about crypto transactions and return a structured JSON response. Follow these guidelines:
      1. Parse the input for transaction type, amount, token/currency, recipient, and other relevant details.
      2. Return an array of JSON objects with the following structure based on the transaction type:
         [
           {
             "action": "send_eth" | "send_erc20" | "swap" | "deploy" | "deploy_and_add_liquidity",
             "chain": string (specified blockchain),
             "amount": number (for send_eth, send_erc20, swap),
             "to": string (recipient address/ENS for send_eth, send_erc20),
             "tokenAddress": string (for send_erc20),
             "fromToken": string (for swap),
             "toToken": string (for swap),
             "name": string (for deploy, deploy_and_add_liquidity),
             "symbol": string (for deploy, deploy_and_add_liquidity),
             "tokenAmount": number (for deploy_and_add_liquidity),
             "nativeAmount": number (for deploy_and_add_liquidity)
           }
         ]
      3. If any information is missing or unclear, use null for that field.
      4. If unable to parse the message for a transaction, return:
         [{ "action": "error", "message": "Failed to parse your message for a transaction." }]
      5. Do not include any explanations or additional text outside the JSON array.
      6. Ensure the JSON is valid and properly formatted.`

      const response = await fetch(
        "http://localhost:11111/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelMap[selectedModel],
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
          } as ChatCompletionRequest),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to get LLM response")
      }

      const data: ChatCompletionResponse = await response.json()
      return data.choices[0].message
    },
    onError: (error: Error) => {
      console.error("LLM error:", error)
    },
  })
}
